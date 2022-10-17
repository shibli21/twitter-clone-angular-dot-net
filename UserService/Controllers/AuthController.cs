using System.Security.Cryptography;
using System.Text;
using Core.Interfaces;
using Core.Models;
using Core.Dtos;
using JWTAuthenticationManager;
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
    private readonly JwtTokenHandler _jwtTokenHandler;

    public AuthController(IUsersService usersService, JwtTokenHandler jwtTokenHandler, IRefreshTokenService refreshTokenService)
    {
        _usersService = usersService;
        _refreshTokenService = refreshTokenService;
        _jwtTokenHandler = jwtTokenHandler;
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
        User? user = await _usersService.GetUserByEmailAsync(userLogin.Email);
        if (user == null)
            return BadRequest(new { field = "email", message = "User not found" });
        if (!this.VerifyPasswordHash(userLogin.Password, user.Password))
            return BadRequest(new { field = "password", message = "Wrong password" });

        var refreshTokenString = Request.Cookies["refreshToken"];
        RefreshToken refreshToken = this.CreateRefreshToken(user);
        RefreshToken newRefreshToken;

        if (string.IsNullOrEmpty(refreshTokenString))
        {
            newRefreshToken = await _refreshTokenService.StoreToken(refreshToken);
        }
        else
        {
            RefreshToken oldToken = await _refreshTokenService.GetTokenByToken(refreshTokenString);
            if (oldToken == null || oldToken.Expires < DateTime.Now || oldToken.UserId != user.Id)
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

        User? user = await _usersService.GetUserAsync(oldToken.UserId);

        if (user == null)
            return Unauthorized(new { field = "refreshToken", message = "User not found." });


        RefreshToken refreshToken = this.CreateRefreshToken(user);
        refreshToken.Id = oldToken.Id;
        RefreshToken newRefreshToken = await _refreshTokenService.UpdateToken(oldToken.Id, refreshToken);
        this.SetRefreshToken(newRefreshToken);

        return Ok(CreateAuthenticationResponse(user, newRefreshToken));
    }


    private AuthenticationResponse CreateAuthenticationResponse(User user, RefreshToken refreshToken)
    {
        JWTResponse jwtResponse = _jwtTokenHandler.GenerateJwtToken(user);

        return new AuthenticationResponse
        {
            JwtExpiresIn = jwtResponse.JwtExpiresIn,
            JwtToken = jwtResponse.JwtToken,
            RefreshToken = refreshToken.Token,
            RefreshTokenExpiresIn = (int)REFRESH_TOKEN_EXPIRY.Subtract(DateTime.Now).TotalSeconds,
            UserName = user.UserName
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
}