

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

    [HttpPost("{followingId}"), Authorize(Roles = "user")]
    public async Task<ActionResult<object>> FollowByUserId(string followingId)
    {
        var msg = await _followerService.FollowByUserId(followingId);
        if (msg == "Followed")
        {
            return Ok(new { message = "Followed successfully" });
        }
        else if (msg == "Unfollowed")
        {
            return Ok(new { message = "Unfollowed successfully" });
        }
        else
        {
            return BadRequest(new { message = "Something went wrong" });
        }
    }


    [HttpGet("followers/{userId}"), Authorize(Roles = "user")]
    public async Task<ActionResult<PaginatedUserResponseDto>> GetFollowersByUserId(string userId,[FromQuery] int size = 5, [FromQuery] int page = 0)
    {
        PaginatedUserResponseDto followers = await _followerService.GetFollowers(userId,size, page);
        return Ok(followers);

    }

    [HttpGet("following/{userId}"), Authorize(Roles = "user")]
    public async Task<ActionResult<PaginatedUserResponseDto>> GetFollowingByUserId(string userId,[FromQuery] int size = 5, [FromQuery] int page = 0)
    {
        PaginatedUserResponseDto following = await _followerService.GetFollowing(userId,size, page);
        return Ok(following);
    }
}
