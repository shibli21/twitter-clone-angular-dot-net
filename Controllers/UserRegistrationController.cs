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
    public class UsersController : ControllerBase
    {
        private readonly IUserService userService;
        public UsersController(IUserService userService)
        {
            this.userService = userService;
        }


        [HttpGet("all")]
        public ActionResult<PaginatedUserResponseDto> GetPaginatedUsers(
            [FromQuery] int size = 5,
            [FromQuery] int page = 0)
        {
            return Ok(userService.GetPaginatedUsers(size, page));
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

    }
}
