
using learnathon_learning_phase.Dtos;
using learnathon_learning_phase.Dtos.Tweet;
using learnathon_learning_phase.Extentions;
using learnathon_learning_phase.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace learnathon_learning_phase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TweetController : ControllerBase
    {
        private readonly ITweetService _tweetService;

        public TweetController(ITweetService tweetService)
        {
            _tweetService = tweetService;
        }

        [HttpPost("create"), Authorize(Roles = "User")]
        public async Task<ActionResult<object>> CreateTweet(TweetRequestDto tweetRequest)
        {
            await _tweetService.CreateTweet(tweetRequest);
            return Ok(new
            {
                Message = "Tweet Created Successfully",
            });
        }

        [HttpGet("{id}"), Authorize(Roles = "User")]
        public async Task<ActionResult<TweetResponseDto>> GetTweetById(string id)
        {
            var tweet = await _tweetService.GetTweetById(id);
            if (tweet == null)
            {
                return NotFound(new
                {
                    Message = "Tweet Not Found",
                });
            }
            return Ok(tweet.AsDto());
        }

        [HttpPut("{id}"), Authorize(Roles = "User")]
        public async Task<ActionResult<TweetResponseDto>> UpdateTweet(string id, TweetRequestDto tweetRequest)
        {
            var tweet = await _tweetService.GetTweetById(id);
            if (tweet == null)
            {
                return NotFound(new
                {
                    Message = "Tweet Not Found",
                });
            }
            await _tweetService.UpdateTweet(tweet,tweetRequest);
            return Ok(tweet.AsDto());
        }

        [HttpDelete("{id}"), Authorize(Roles = "User")]
        public async Task<ActionResult<object>> DeleteTweet(string id)
        {
            var tweet = await _tweetService.GetTweetById(id);
            if (tweet == null)
            {
                return NotFound(new
                {
                    Message = "Tweet Not Found",
                });
            }
            await _tweetService.DeleteTweet(id);
            return Ok(new
            {
                Message = "Tweet Deleted Successfully",
            });
        }

    }
}