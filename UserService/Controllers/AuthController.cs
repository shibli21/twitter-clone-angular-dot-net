using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using JWTAuthenticationManager;
using MassTransit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UserService.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    public const int REFRESH_TOKEN_VALIDITY_DAY = 2;
    public DateTime REFRESH_TOKEN_EXPIRY = DateTime.Now.AddDays(REFRESH_TOKEN_VALIDITY_DAY);

    private readonly IUsersService _usersService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IForgotPasswordService _forgotPasswordService;
    private readonly JwtTokenHandler _jwtTokenHandler;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IBus _bus;

    public AuthController(IUsersService usersService, JwtTokenHandler jwtTokenHandler, IRefreshTokenService refreshTokenService, IHttpContextAccessor httpContextAccessor, IForgotPasswordService forgotPasswordService, IBus bus)
    {
        _usersService = usersService;
        _jwtTokenHandler = jwtTokenHandler;
        _refreshTokenService = refreshTokenService;
        _httpContextAccessor = httpContextAccessor;
        _forgotPasswordService = forgotPasswordService;
        _bus = bus;
    }

    [HttpPost]
    [Route("register")]
    public async Task<ActionResult<UserResponseDto>> CreateUser([FromBody] UserRequestDto user)
    {
        var hashedPassword = CreatePasswordHash(user.Password);

        var newUser = new User
        {
            UserName = user.UserName,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Gender = user.Gender,
            DateOfBirth = user.DateOfBirth,
            Password = hashedPassword,
        };

        await _usersService.CreateUserAsync(newUser);

        return Ok(newUser.AsDto());
    }

    [HttpPost]
    [Route("login")]
    public async Task<ActionResult<AuthenticationResponse>> LoginUser([FromBody] UserLoginDto userLogin)
    {
        User? userFromDb = await _usersService.GetUserByEmailAsync(userLogin.Email);
        if (userFromDb == null)
            return BadRequest(new { field = "email", message = "User not found" });
        if (!this.VerifyPasswordHash(userLogin.Password, userFromDb.Password))
            return BadRequest(new { field = "password", message = "Wrong password" });
        if (userFromDb.DeletedAt != null)
            return BadRequest(new { field = "email", message = "User is deleted" });
        if (userFromDb.BlockedAt != null)
            return BadRequest(new { field = "email", message = "User is blocked" });

        var refreshTokenString = Request.Cookies["refreshToken"];
        RefreshToken refreshToken = this.CreateRefreshToken(userFromDb);
        RefreshToken newRefreshToken;

        if (string.IsNullOrEmpty(refreshTokenString))
        {
            newRefreshToken = await _refreshTokenService.StoreToken(refreshToken);
        }
        else
        {
            RefreshToken oldToken = await _refreshTokenService.GetTokenByToken(refreshTokenString);
            if (oldToken == null || oldToken.Expires < DateTime.Now || oldToken.UserId != userFromDb.Id)
            {
                newRefreshToken = await _refreshTokenService.StoreToken(refreshToken);
            }
            else
            {
                refreshToken.Id = oldToken.Id;
                newRefreshToken = await _refreshTokenService.UpdateToken(oldToken.Id, refreshToken);
            }
        }

        this.SetRefreshToken(newRefreshToken);



        UserResponseDto user = userFromDb.AsDto();
        user.Followers = await _usersService.GetFollowerCount(user.Id);
        user.Following = await _usersService.GetFollowingCount(user.Id);

        return Ok(CreateAuthenticationResponse(user, newRefreshToken));
    }

    [HttpDelete("logout")]
    [Authorize]
    public async Task<ActionResult<object>> logout()
    {
        UserResponseDto? user = await _usersService.GetAuthUser();
        if (user == null)
            return Unauthorized(new { field = "user", message = "User not found" });

        var refreshTokenString = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshTokenString))
        {
            return Unauthorized(new { field = "refreshToken", message = "Refresh token not found" });
        }
        RefreshToken refreshToken = await _refreshTokenService.GetTokenByToken(refreshTokenString);
        if (refreshToken == null || refreshToken.UserId != user.Id)
        {
            return Unauthorized(new { field = "refreshToken", message = "Refresh token not found" });
        }
        await _refreshTokenService.DeleteToken(refreshToken.Id);
        Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            Expires = DateTime.Now.AddDays(-1),
            HttpOnly = true,
            SameSite = SameSiteMode.None,
            Secure = true
        });
        return Ok(new { message = "Logout success" });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult<object>> ChangePassword(PasswordChangeDto passwordChangeDto)
    {
        if (_httpContextAccessor.HttpContext != null)
        {
            string? id = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (id == null)
                return Unauthorized(new { field = "user", message = "User not found" });
            User? user = await _usersService.GetUserAsync(id);
            if (user == null)
                return Unauthorized(new { field = "user", message = "User not found" });
            if (!this.VerifyPasswordHash(passwordChangeDto.OldPassword, user.Password))
                return BadRequest(new { field = "oldPassword", message = "Wrong password" });
            user.Password = this.CreatePasswordHash(passwordChangeDto.NewPassword);
            await _usersService.UpdateGetUserAsync(id, user);
            return Ok(new { message = "Password changed" });
        }
        return Unauthorized(new { field = "user", message = "User not found" });
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<object>> ForgotPassword(ForgotPasswordDto forgotPasswordDto)
    {
        User? user = await _usersService.GetUserByEmailAsync(forgotPasswordDto.Email);
        if (user == null)
            return BadRequest(new { field = "email", message = "User not found" });
        if (user.DeletedAt != null)
            return BadRequest(new { field = "email", message = "User is deleted" });
        if (user.BlockedAt != null)
            return BadRequest(new { field = "email", message = "User is blocked" });
        string token = this.CreatePasswordResetToken();
        await _forgotPasswordService.StoreResetPasswordTokenAsync(user, token);
        MailDto mailDto = new MailDto
        {
            To = user.Email,
            Subject = "Reset Password",
            ResetPasswordUrl = $"{forgotPasswordDto.ResetPasswordUrl}?token={token}",
            User = user
        };
        await _bus.Publish(mailDto);
        return Ok(new { message = "Reset password email sent" });
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<object>> ResetPassword(ResetPasswordDto resetPasswordDto)
    {
        User? user = await _forgotPasswordService.GetUserByResetTokenAsync(resetPasswordDto.Token);
        if (user == null)
            return BadRequest(new { field = "token", message = "Token not found" });
        if (user.DeletedAt != null)
            return BadRequest(new { field = "token", message = "User is deleted" });
        if (user.BlockedAt != null)
            return BadRequest(new { field = "token", message = "User is blocked" });
        user.Password = this.CreatePasswordHash(resetPasswordDto.Password);
        await _usersService.UpdateGetUserAsync(user.Id, user);
        await _forgotPasswordService.DeleteResetPasswordTokenAsync(resetPasswordDto.Token);
        return Ok(new { message = "Password changed" });
    }



    [HttpPost]
    [Route("refresh-token")]
    public async Task<ActionResult<object>> RefreshToken()
    {

        var refreshTokenString = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshTokenString))
            return Unauthorized(new { field = "refreshToken", message = "Refresh token is required." });
        RefreshToken oldToken = await _refreshTokenService.GetTokenByToken(refreshTokenString);
        if (oldToken == null)
            return Unauthorized(new { field = "refreshToken", message = "Refresh token is invalid." });
        if (oldToken.Expires < DateTime.Now)
            return Unauthorized(new { field = "refreshToken", message = "Refresh token is expired." });

        User? userFromDb = await _usersService.GetUserAsync(oldToken.UserId);

        if (userFromDb == null)
            return Unauthorized(new { field = "refreshToken", message = "User not found." });
        if (userFromDb.BlockedAt != null)
            return Unauthorized(new { field = "refreshToken", message = "User is blocked." });


        RefreshToken refreshToken = this.CreateRefreshToken(userFromDb);
        refreshToken.Id = oldToken.Id;
        RefreshToken newRefreshToken = await _refreshTokenService.UpdateToken(oldToken.Id, refreshToken);
        this.SetRefreshToken(newRefreshToken);


        UserResponseDto user = userFromDb.AsDto();
        user.Followers = await _usersService.GetFollowerCount(user.Id);
        user.Following = await _usersService.GetFollowingCount(user.Id);

        return Ok(CreateAuthenticationResponse(user, newRefreshToken));
    }


    private AuthenticationResponse CreateAuthenticationResponse(UserResponseDto user, RefreshToken refreshToken)
    {
        JWTResponse jwtResponse = _jwtTokenHandler.GenerateJwtToken(user);

        return new AuthenticationResponse
        {
            JwtExpiresIn = jwtResponse.JwtExpiresIn,
            JwtToken = jwtResponse.JwtToken,
            RefreshToken = refreshToken.Token,
            RefreshTokenExpiresIn = (int)REFRESH_TOKEN_EXPIRY.Subtract(DateTime.Now).TotalSeconds,
            UserName = user.UserName,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role,
            Address = user.Address,
            Bio = user.Bio,
            CoverPictureUrl = user.CoverPictureUrl,
            ProfilePictureUrl = user.ProfilePictureUrl,
            CreatedAt = user.CreatedAt,
            Id = user.Id,
            DateOfBirth = user.DateOfBirth,
            Gender = user.Gender,
            Followers = user.Followers,
            Following = user.Following,

        };
    }

    private RefreshToken CreateRefreshToken(User user)
    {
        var refreshToken = new RefreshToken
        {
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            Created = DateTime.Now,
            Expires = REFRESH_TOKEN_EXPIRY,
            UserId = user.Id
        };
        return refreshToken;
    }

    private void SetRefreshToken(RefreshToken refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            Expires = refreshToken.Expires,
            HttpOnly = true,
            SameSite = SameSiteMode.None,
            Secure = true
        };
        Response.Cookies.Append("refreshToken", refreshToken.Token, cookieOptions);
    }

    private bool VerifyPasswordHash(string password, string hash)
    {
        using (SHA256 sha256Hash = SHA256.Create())
        {
            byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(password));

            StringBuilder stringBuilder = new StringBuilder();
            for (int i = 0; i < bytes.Length; i++)
            {
                stringBuilder.Append(bytes[i].ToString("x2"));
            }
            return stringBuilder.ToString().Equals(hash);
        }
    }

    private string CreatePasswordHash(string password)
    {
        using (SHA256 sha256Hash = SHA256.Create())
        {
            byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(password));

            StringBuilder stringBuilder = new StringBuilder();
            for (int i = 0; i < bytes.Length; i++)
            {
                stringBuilder.Append(bytes[i].ToString("x2"));
            }
            return stringBuilder.ToString();
        }
    }

    private string CreatePasswordResetToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)).Replace("/", "_").Replace("+", "-");
    }
}