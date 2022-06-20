using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using learnathon_learning_phase.Extentions;
using learnathon_learning_phase.Models;
using learnathon_learning_phase.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace learnathon_learning_phase.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService userService;
        private readonly IRefreshTokenService refreshTokenService;
        private readonly IConfiguration _configuration;


        public UsersController(IUserService userService, IRefreshTokenService refreshTokenService, IConfiguration configuration)
        {
            this.userService = userService;
            this.refreshTokenService = refreshTokenService;
            this._configuration = configuration;
        }


        [HttpGet("all"), Authorize(Roles = "User")]
        public async Task<ActionResult<PaginatedUserResponseDto>> GetPaginatedUsers(
            [FromQuery] int size = 5,
            [FromQuery] int page = 0)
        {
            object response = await userService.GetPaginatedUsers(size, page);
            return Ok(response);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetUserById(string id)
        {
            UserModel user = await userService.GetUserById(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user.AsDto());
        }

        [HttpPatch("edit", Name = "EditUser")]
        public async Task<ActionResult<UserResponseDto>> EditUser(UserEditRequestDto user)
        {
            UserModel userModel = await userService.GetUserById(user.Id);
            if (userModel == null)
            {
                return NotFound();
            }

            userModel.Email = user.Email;
            userModel.DateOfBirth = user.DateOfBirth;

            await userService.UpdateUser(userModel);
            return Ok(userModel.AsDto());
        }

        [HttpPost]
        [Route("register")]
        public async Task<ActionResult<UserResponseDto>> create(UserRegistrationDto userRegistrationDto)
        {
            var pass = this.CreatePasswordHash(userRegistrationDto.Password);
            var user = new UserModel
            {
                Username = userRegistrationDto.Username,
                Password = pass,
                Email = userRegistrationDto.Email,
                DateOfBirth = userRegistrationDto.DateOfBirth
            };
            UserModel newUser = await userService.RegisterUser(user);

            return CreatedAtAction(nameof(GetUserById), new { id = newUser.Id }, user.AsDto());
        }



        [HttpPost]
        [Route("login")]
        public async Task<ActionResult<object>> signin(UserLoginDto request)
        {
            UserModel user = await userService.GetUserByEmail(request.Email);
            if (user == null)
                return BadRequest(new { field = "email", message = "User not found" });
            if (!this.VerifyPasswordHash(request.Password, user.Password))
                return BadRequest(new { field = "password", message = "Wrong password" });


            var refreshTokenString = Request.Cookies["refreshToken"];
            RefreshTokenModel refreshToken = this.CreateRefreshToken(user);
            RefreshTokenModel newRefreshToken;

            if (string.IsNullOrEmpty(refreshTokenString))
            {
                newRefreshToken = await refreshTokenService.StoreToken(refreshToken);
            }
            else
            {
                RefreshTokenModel oldToken = await refreshTokenService.GetTokenByToken(refreshTokenString);
                if (oldToken == null || oldToken.Expires < DateTime.Now || oldToken.UserId != user.Id)
                {
                    newRefreshToken = await refreshTokenService.StoreToken(refreshToken);
                }
                else
                {
                    refreshToken.Id = oldToken.Id;
                    newRefreshToken = await refreshTokenService.UpdateToken(oldToken.Id, refreshToken);
                }
            }
            string token = this.CreateToken(user);
            this.SetRefreshToken(newRefreshToken);
            return Ok(new { token, expires = DateTime.Now.AddMinutes(30) });
        }


        [HttpDelete("logout"), Authorize]
        public async Task<ActionResult<object>> logout()
        {
            UserModel? user = await userService.GetAuthUser();
            if (user == null)
                return Unauthorized(new { field = "user", message = "User not found" });

            var refreshTokenString = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshTokenString))
            {
                return Unauthorized(new { field = "refreshToken", message = "Refresh token not found" });
            }
            RefreshTokenModel refreshToken = await refreshTokenService.GetTokenByToken(refreshTokenString);
            if (refreshToken == null || refreshToken.UserId != user.Id)
            {
                return Unauthorized(new { field = "refreshToken", message = "Refresh token not found" });
            }
            await refreshTokenService.DeleteToken(refreshToken.Id);
            Response.Cookies.Delete("refreshToken");
            return Ok(new { message = "Logout success" });
        }



        [HttpPost]
        [Route("refresh-token")]
        public async Task<ActionResult<object>> RefreshToken()
        {

            var refreshTokenString = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshTokenString))
                return Unauthorized(new { field = "refreshToken", message = "Refresh token is required." });
            RefreshTokenModel oldToken = await refreshTokenService.GetTokenByToken(refreshTokenString);
            if (oldToken == null)
                return Unauthorized(new { field = "refreshToken", message = "Refresh token is invalid." });
            if (oldToken.Expires < DateTime.Now)
                return Unauthorized(new { field = "refreshToken", message = "Refresh token is expired." });

            UserModel user = await userService.GetUserById(oldToken.UserId);

            if (user == null)
                return Unauthorized(new { field = "refreshToken", message = "User not found." });


            string token = this.CreateToken(user);
            RefreshTokenModel refreshToken = this.CreateRefreshToken(user);
            refreshToken.Id = oldToken.Id;
            RefreshTokenModel newRefreshToken = await refreshTokenService.UpdateToken(oldToken.Id, refreshToken);
            this.SetRefreshToken(newRefreshToken);
            return Ok(new { token, expires = DateTime.Now.AddMinutes(30) });
        }


        [HttpGet("current-user"), Authorize]
        public async Task<ActionResult<UserRegistrationDto>> GetCurrentUser()
        {
            UserModel? user = await userService.GetAuthUser();
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user.AsDto());
        }


        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(string id)
        {
            UserModel user = await userService.GetUserById(id);
            if (user == null)
            {
                return NotFound();
            }
            await userService.DeleteUser(id);
            return NoContent();
        }

        private string CreatePasswordHash(string password)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(password));

                StringBuilder stringbuilder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    stringbuilder.Append(bytes[i].ToString("x2"));
                }
                return stringbuilder.ToString();
            }
        }

        private bool VerifyPasswordHash(string password, string hash)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(password));

                StringBuilder stringbuilder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    stringbuilder.Append(bytes[i].ToString("x2"));
                }
                return stringbuilder.ToString().Equals(hash);
            }
        }

        private string CreateToken(UserModel user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Role, "User")
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("AppSettings:Token").Value));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);

        }

        private RefreshTokenModel CreateRefreshToken(UserModel user)
        {
            var refreshToken = new RefreshTokenModel
            {
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                Created = DateTime.Now,
                Expires = DateTime.Now.AddDays(7),
                UserId = user.Id
            };
            return refreshToken;
        }


        private void SetRefreshToken(RefreshTokenModel refreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                Expires = refreshToken.Expires,
                HttpOnly = true
            };
            Response.Cookies.Append("refreshToken", refreshToken.Token, cookieOptions);
        }




    }
}
