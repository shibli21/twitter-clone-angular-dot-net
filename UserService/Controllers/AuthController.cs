using System.Security.Cryptography;
using System.Text;
using Core.Interfaces;
using Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace UserService.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUsersService _usersService;

    public AuthController(IUsersService usersService)
    {
        _usersService = usersService;
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