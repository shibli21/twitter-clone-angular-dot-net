using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UserService.Controllers;

[ApiController]
[Route("[controller]")]
public class BlockController : ControllerBase
{
    private readonly IUsersService _usersService;
    private readonly IBlockService _blockService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public BlockController(IUsersService usersService, IHttpContextAccessor httpContextAccessor, IBlockService blockService)
    {
        _usersService = usersService;
        _httpContextAccessor = httpContextAccessor;
        _blockService = blockService;
    }

    [HttpPost("by-admin/{id}"), Authorize(Roles = "admin")]
    public async Task<ActionResult<object>> BlockByAdmin(string id)
    {
        User? user = await _usersService.GetUserAsync(id);
        if (user == null)
        {
            return NotFound();
        }
        string? msg;
        if(user.BlockedAt != null)
        {
            user.BlockedAt = null;
            msg = "User unblocked";
        }
        else
        {
            user.BlockedAt = DateTime.Now;
            msg = "User blocked";
        }
        await _usersService.UpdateGetUserAsync(id, user);
        return Ok(new {message = msg});

    }

    [HttpGet("by-admin"), Authorize(Roles = "admin")]
    public async Task<ActionResult<PaginatedUserResponseDto>> GetBlockedUsersByAdmin([FromQuery] int size = 20, [FromQuery] int page = 0)
    {
        return Ok(await _blockService.GetAdminBlockedUsers(size, page));
    }

    [HttpPost("by-user/{id}"), Authorize(Roles = "user")]
    public async Task<ActionResult<object>> BlockByUser(string id)
    {
        string msg = await _blockService.BlockByUser(id);
        if(msg == "Something went wrong")
        {
            return BadRequest(new {message = msg});
        }
        return Ok(new {message = msg});
    }

    [HttpGet("by-user"), Authorize(Roles = "user")]
    public async Task<ActionResult<PaginatedUserResponseDto>> GetBlockedUsersByUser([FromQuery] int size = 20, [FromQuery] int page = 0)
    {
        return Ok(await _blockService.GetUserBlockedUsers(size, page));
    }

    
}
