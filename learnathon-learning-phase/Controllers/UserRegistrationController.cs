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
        private readonly IConfiguration _configuration;


        public UsersController(IUserService userService, IConfiguration configuration)
        {
            this.userService = userService;
            this._configuration = configuration;

        }


        [HttpGet("all"), Authorize(Roles = "User")]
        public async Task< ActionResult<PaginatedUserResponseDto>> GetPaginatedUsers(
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

        [HttpPost("edit", Name = "EditUser")]
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
            
            // through error
            


            if (user == null)
                return BadRequest(new { field = "email", message = "User not found" });
            if (!this.VerifyPasswordHash(request.Password, user.Password))
                return BadRequest(new { field = "password", message = "Wrong password" });

            string token = this.CreateToken(user);
            return Ok(new { token, expires = DateTime.Now.AddDays(1) });
            //return Ok();
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
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);

        }
    }
}
