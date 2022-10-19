

using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Core.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TweetController : ControllerBase
    {
        private readonly ITweetService _tweetService;
        private readonly IUsersService _usersService;
        private readonly ILikeCommentService _iLikeCommentService;

        public TweetController(ITweetService tweetService, ILikeCommentService iLikeCommentService, IUsersService usersService)
        {
            _tweetService = tweetService;
            _iLikeCommentService = iLikeCommentService;
            _usersService = usersService;
        }

        [HttpPost("create"), Authorize]
        public async Task<ActionResult<TweetResponseDto>> CreateTweet(TweetRequestDto tweetRequest)
        {
            Tweets? tweet = await _tweetService.CreateTweet(tweetRequest);
            if (tweet != null)
            {
                return Ok(tweet.AsDto());
            }
            return BadRequest(new { message = "Tweet could not be created" });
        }

        [HttpGet("{id}"), Authorize]
        public async Task<ActionResult<TweetResponseDto>> GetTweetById(string id)
        {
            Tweets? tweet = await _tweetService.GetTweetById(id);
            if (tweet == null)
            {
                return NotFound(new
                {
                    Message = "Tweet Not Found",
                });
            }
            TweetResponseDto tweetResponse = tweet.AsDto();
            TweetCommentUserResponseDto? user = (await _usersService.GetUserAsync(tweet.UserId))?.AsDtoTweetComment();
            tweetResponse.User = user;
            LikedOrRetweetedDto likedOrRetweet = await _iLikeCommentService.IsLikedOrRetweeted(id);
            tweetResponse.IsLiked = likedOrRetweet.IsLiked;
            tweetResponse.IsRetweeted = likedOrRetweet.IsRetweeted;
            return Ok(tweetResponse);
        }

        [HttpPut("{id}"), Authorize]
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
            await _tweetService.UpdateTweet(tweet, tweetRequest);
            TweetResponseDto tweetResponse = tweet.AsDto();
            LikedOrRetweetedDto likedOrRetweet = await _iLikeCommentService.IsLikedOrRetweeted(id);
            tweetResponse.IsLiked = likedOrRetweet.IsLiked;
            tweetResponse.IsRetweeted = likedOrRetweet.IsRetweeted;
            return Ok(tweetResponse);
        }

        [HttpDelete("{id}"), Authorize]
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
            await _tweetService.DeleteTweet(tweet);
            return Ok(new
            {
                Message = "Tweet Deleted Successfully",
            });
        }


        [HttpPost("like/{tweetId}"), Authorize]
        public async Task<ActionResult<object>> LikeTweet(string tweetId)
        {
            string msg = await _iLikeCommentService.LikeTweet(tweetId);
            if (msg == "Something went wrong")
            {
                return BadRequest(new { Message = msg });
            }
            else
            {
                return Ok(new { Message = msg });
            }
        }

        [HttpGet("liked-users/{tweetId}"), Authorize]
        public async Task<ActionResult<List<TweetCommentUserResponseDto>>> GetLikedUsers(string tweetId, [FromQuery] int size = 5, [FromQuery] int page = 0)
        {
            List<TweetCommentUserResponseDto> likedUsers = await _iLikeCommentService.GetLikedUsers(size, page, tweetId);
            return Ok(likedUsers);
        }

        [HttpPost("comment/{tweetId}"), Authorize]
        public async Task<ActionResult<CommentResponseDto>> Comment(string tweetId, CommentRequestDto commentRequest)
        {
            CommentResponseDto? comment = await _iLikeCommentService.Comment(tweetId, commentRequest.Comment);
            if (comment == null)
            {
                return BadRequest(new { Message = "Something went wrong" });
            }
            return Ok(comment);
        }

        [HttpDelete("comment/{commentId}"), Authorize]
        public async Task<ActionResult<object>> DeleteComment(string commentId)
        {
            bool isDeleted = await _iLikeCommentService.DeleteComment(commentId);
            if (isDeleted)
            {
                return Ok(new { Message = "Comment Deleted Successfully" });
            }
            return BadRequest(new { Message = "Something went wrong" });
        }

        [HttpPut("comment/{commentId}"), Authorize]
        public async Task<ActionResult<CommentResponseDto>> UpdateComment(string commentId, CommentRequestDto commentRequest)
        {
            CommentResponseDto? comment = await _iLikeCommentService.UpdateComment(commentId, commentRequest.Comment);
            if (comment == null)
            {
                return BadRequest(new { Message = "Something went wrong" });
            }
            return Ok(comment);
        }

        [HttpGet("comments/{tweetId}"), Authorize]
        public async Task<ActionResult<List<CommentResponseDto>>> GetComments(string tweetId, [FromQuery] int size = 5, [FromQuery] int page = 0)
        {
            List<CommentResponseDto> comments = await _iLikeCommentService.GetComments(size, page, tweetId);
            return Ok(comments);
        }

        [HttpGet("user-tweets/{userId}"), Authorize]
        public async Task<ActionResult<PaginatedTweetResponseDto>> GetUserTweets(string userId, [FromQuery] int size = 20, [FromQuery] int page = 0)
        {
            TweetCommentUserResponseDto? user = (await _usersService.GetUserAsync(userId))?.AsDtoTweetComment();
            if (user == null)
            {
                return NotFound(new { Message = "User Not Found" });
            }
            PaginatedTweetResponseDto tweets = await _tweetService.GetTweetsByUserId(userId, size, page);
            if (tweets.Tweets != null)
            {
                foreach (TweetResponseDto tweet in tweets.Tweets)
                {
                    tweet.User = user;
                    LikedOrRetweetedDto likedOrRetweet = await _iLikeCommentService.IsLikedOrRetweeted(tweet.Id);
                    tweet.IsLiked = likedOrRetweet.IsLiked;
                    tweet.IsRetweeted = likedOrRetweet.IsRetweeted;
                }
            }
            return Ok(tweets);
        }


    }
}