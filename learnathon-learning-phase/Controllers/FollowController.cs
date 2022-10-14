
using learnathon_learning_phase.Models;
using learnathon_learning_phase.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace learnathon_learning_phase.Controllers
{
    [Route("api")]
    [ApiController]
    public class FollowController : ControllerBase
    {
        private readonly IFollowerService _followerService;
        
        public FollowController(IFollowerService followerService)
        {
            _followerService = followerService;
        }
        
        [HttpPost("follow/{followingId}"), Authorize(Roles = "User")]
        public async Task<ActionResult<object>> FollowByUserId( string followingId)
        {
            await _followerService.FollowByUserId( followingId);
            return Ok(new { message = "Followed successfully" });
        }

        [HttpDelete("unfollow/{followingId}"), Authorize(Roles = "User")]
        public async Task<ActionResult<object>> UnfollowByUserId(string followingId)
        {
            await _followerService.UnFollowByUserId( followingId);
            return Ok(new { message = "Unfollowed successfully" });
        }
        
        [HttpGet("followers"), Authorize(Roles = "User")]
        public async Task<List<FollowModel>> GetFollowersByUserId()
        {
            return await _followerService.GetFollowers();
        }
        
        [HttpGet("following"), Authorize(Roles = "User")]
        public async Task<List<FollowModel>> GetFollowingByUserId()
        {
            return await _followerService.GetFollowing();
        }
    }
}