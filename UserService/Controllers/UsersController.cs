using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UserService.Controllers;

[ApiController]
[Route("[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUsersService _usersService;

    public UsersController(IUsersService usersService)
    {
        _usersService = usersService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponseDto?>> GetUserById(string id)
    {
        User? user = await _usersService.GetUserAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(user.AsDto());
    }

    [HttpGet("current-user"), Authorize]
    public async Task<ActionResult<UserResponseDto?>> GetCurrentUser()
    {
        User? user = await _usersService.GetAuthUser();
        if (user == null)
        {
            return NotFound();
        }

        return Ok(user.AsDto());
    }
}
