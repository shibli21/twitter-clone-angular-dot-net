using System.Security.Cryptography;
using System.Text;
using learnathon_learning_phase.Extentions;
using learnathon_learning_phase.Models;
using learnathon_learning_phase.Services;
using Microsoft.AspNetCore.Mvc;

namespace learnathon_learning_phase.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserRegistrationController : ControllerBase
    {
        private readonly IUserService userService;
        public UserRegistrationController(IUserService userService)
        {
            this.userService = userService;
        }



        [HttpGet("{{email}}")]
        public async Task<ActionResult<UserModel>> GetUser(string email)
        {
            UserModel user = await userService.GetUserByEmail(email);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
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
            await userService.RegisterUser(user);

            return CreatedAtAction(nameof(GetUser), new { email = userRegistrationDto.Email }, user.AsDto());
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

    }
}
