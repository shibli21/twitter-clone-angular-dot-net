

using System.Security.Claims;
using Core.Dtos;
using Core.Interfaces;
using MassTransit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UserService.Controllers;

[Route("[controller]")]
[ApiController]
public class FollowController : ControllerBase
{
    private readonly IFollowerService _followerService;
    private readonly IBus _bus;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public FollowController(IFollowerService followerService, IBus bus, IHttpContextAccessor httpContextAccessor)
    {
        _followerService = followerService;
        _bus = bus;
        _httpContextAccessor = httpContextAccessor;
    }
    [HttpPost("{followingId}"), Authorize]
    public async Task<ActionResult<object>> FollowByUserId(string followingId)
    {
        var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }
        var msg = await _followerService.FollowByUserId(userId, followingId);
        if (msg == "Followed")
        {
            // Publish to RabbitMQ Start
            CacheNotificationConsumerDto cacheNotificationConsumerDto = new CacheNotificationConsumerDto
            {
                Type = "Follow",
                IsNotification = true,
                Notification = new NotificationCreateDto
                {
                    UserId = followingId,
                    RefUserId = userId,
                    Type = "Follow",
                },
                UserId = followingId,
                RefUserId = userId,
            };

            await _bus.Publish(cacheNotificationConsumerDto);
            // Publish to RabbitMQ End

            return Ok(new { message = "Followed successfully" });
        }
        else if (msg == "Unfollowed")
        {
            // Publish to RabbitMQ Start
            CacheNotificationConsumerDto cacheNotificationConsumerDto = new CacheNotificationConsumerDto
            {
                Type = "Unfollow",
                IsNotification = false,
                UserId = followingId,
                RefUserId = userId,
            };
            await _bus.Publish(cacheNotificationConsumerDto);
            // Publish to RabbitMQ End


            return Ok(new { message = "Unfollowed successfully" });
        }
        else
        {
            return BadRequest(new { message = "Something went wrong" });
        }
    }


    [HttpGet("followers/{userId}"), Authorize]
    public async Task<ActionResult<PaginatedUserResponseDto>> GetFollowersByUserId(string userId, [FromQuery] int size = 5, [FromQuery] int page = 0)
    {
        PaginatedUserResponseDto followers = await _followerService.GetFollowers(userId, size, page);
        return Ok(followers);

    }

    [HttpGet("following/{userId}"), Authorize]
    public async Task<ActionResult<PaginatedUserResponseDto>> GetFollowingByUserId(string userId, [FromQuery] int size = 5, [FromQuery] int page = 0)
    {
        PaginatedUserResponseDto following = await _followerService.GetFollowing(userId, size, page);
        return Ok(following);
    }

}
