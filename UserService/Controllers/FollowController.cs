

using Core.Dtos;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UserService.Controllers;

[Route("[controller]")]
[ApiController]
public class FollowController : ControllerBase
{
    private readonly IFollowerService _followerService;

    public FollowController(IFollowerService followerService)
    {
        _followerService = followerService;
    }

    [HttpPost("follow/{followingId}"), Authorize(Roles = "user")]
    public async Task<ActionResult<object>> FollowByUserId(string followingId)
    {
        await _followerService.FollowByUserId(followingId);
        return Ok(new { message = "Followed successfully" });
    }

    [HttpDelete("unfollow/{followingId}"), Authorize(Roles = "user")]
    public async Task<ActionResult<object>> UnfollowByUserId(string followingId)
    {
        await _followerService.UnFollowByUserId(followingId);
        return Ok(new { message = "Unfollowed successfully" });
    }

    [HttpGet("followers"), Authorize(Roles = "user")]
    public async Task<ActionResult<List<UserResponseDto>>> GetFollowersByUserId([FromQuery] int size = 5, [FromQuery] int page = 0)
    {
        List<UserResponseDto> followers = await _followerService.GetFollowers(size, page);
        return Ok(followers);

    }

    [HttpGet("following"), Authorize(Roles = "user")]
    public async Task<ActionResult<List<UserResponseDto>>> GetFollowingByUserId([FromQuery] int size = 5, [FromQuery] int page = 0)
    {
        List<UserResponseDto> following = await _followerService.GetFollowing(size, page);
        return Ok(following);
    }
}
