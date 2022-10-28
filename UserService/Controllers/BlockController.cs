using System.Security.Claims;
using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using MassTransit;
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
    private readonly IBus _bus;

    public BlockController(IUsersService usersService, IHttpContextAccessor httpContextAccessor, IBlockService blockService, IBus bus)
    {
        _usersService = usersService;
        _httpContextAccessor = httpContextAccessor;
        _blockService = blockService;
        _bus = bus;
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
        if (user.BlockedAt != null)
        {
            user.BlockedAt = null;
            msg = "User unblocked";
        }
        else
        {
            user.BlockedAt = DateTime.Now;
            msg = "User blocked";
            // Publish to RabbitMQ Start
            publishToRabbitMQ("Block by admin", id, null);

            // Publish to RabbitMQ End
        }
        await _usersService.UpdateGetUserAsync(id, user);
        return Ok(new { message = msg });

    }

    [HttpGet("by-admin"), Authorize(Roles = "admin")]
    public async Task<ActionResult<PaginatedUserResponseDto>> GetBlockedUsersByAdmin([FromQuery] int size = 20, [FromQuery] int page = 0)
    {
        return Ok(await _blockService.GetAdminBlockedUsers(size, page));
    }

    [HttpPost("by-user/{id}"), Authorize]
    public async Task<ActionResult<object>> BlockByUser(string id)
    {
        var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }
        if(userId == id)
        {
            return BadRequest(new { message = "You can't block yourself" });
        }
        string msg = await _blockService.BlockByUser(id);
        if (msg == "Something went wrong")
        {
            return BadRequest(new { message = msg });
        }

        // Publish to RabbitMQ Start
        if (msg == "User blocked successfully")
        {
            publishToRabbitMQ("Block by user", id, userId);
        }
        // Publish to RabbitMQ End
        return Ok(new { message = msg });
    }

    [HttpGet("by-user"), Authorize]
    public async Task<ActionResult<PaginatedUserResponseDto>> GetBlockedUsersByUser([FromQuery] int size = 20, [FromQuery] int page = 0)
    {
        return Ok(await _blockService.GetUserBlockedUsers(size, page));
    }

    private async void publishToRabbitMQ(string type, string? userId, string? refUserId)
    {
        CacheNotificationConsumerDto cacheNotificationConsumerDto = new CacheNotificationConsumerDto
        {
            Type = type,
            IsNotification = false,
            Notification = null,
            Tweet = null,
            UserId = userId,
            RefUserId = refUserId
        };
        await _bus.Publish(cacheNotificationConsumerDto);
    }

}
