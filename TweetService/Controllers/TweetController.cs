

using System.Security.Claims;
using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using MassTransit;
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
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IBus _bus;

        public TweetController(ITweetService tweetService, ILikeCommentService iLikeCommentService, IUsersService usersService, IHttpContextAccessor httpContextAccessor, IBus bus)
        {
            _tweetService = tweetService;
            _iLikeCommentService = iLikeCommentService;
            _usersService = usersService;
            _httpContextAccessor = httpContextAccessor;
            _bus = bus;
        }
        [HttpPost("create"), Authorize]
        public async Task<ActionResult<TweetResponseDto>> CreateTweet(TweetRequestDto tweetRequest)
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }
            Tweets? tweet = await _tweetService.CreateTweet(userId, tweetRequest);
            if (tweet != null)
            {
                TweetResponseDto tweetResponse = tweet.AsDto();
                User? user = await _usersService.GetUserAsync(userId);
                if (user == null || user.DeletedAt != null || user.BlockedAt != null)
                {
                    return Unauthorized(new { message = "User not found" });
                }
                tweetResponse.User = user.AsDtoTweetComment();

                CacheNotificationConsumerDto cacheNotificationConsumerDto = new CacheNotificationConsumerDto
                {
                    Type = "Create Tweet",
                    IsNotification = true,
                    Tweet = tweetResponse,
                };
                await _bus.Publish(cacheNotificationConsumerDto);
                return Ok(tweetResponse);

            }
            return BadRequest(new { message = "Tweet could not be created" });
        }

        [HttpPost("retweet/{id}"), Authorize]
        public async Task<ActionResult<TweetResponseDto>> CreateRetweet(string id, RetweetRequestDto tweetRequest)
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }
            Tweets? refTweet = await _tweetService.GetTweetById(id);
            if (refTweet == null)
            {
                return BadRequest(new { message = "Tweet could not be found" });
            }
            Tweets? tweet = await _tweetService.CreateRetweet(userId, refTweet, tweetRequest);
            if (tweet != null)
            {
                User? tweetOwner = await _usersService.GetUserAsync(refTweet.UserId);
                if (tweetOwner == null || tweetOwner.BlockedAt != null || tweetOwner.DeletedAt != null)
                {
                    return BadRequest(new { message = "Tweet owner could not be found" });
                }
                refTweet.RetweetCount += 1;
                await _tweetService.UpdateTweetAsync(id, refTweet);
                TweetResponseDto tweetResponse = tweet.AsDto();
                User? user = await _usersService.GetUserAsync(userId);
                if (user == null || user.DeletedAt != null || user.BlockedAt != null)
                {
                    return Unauthorized(new { message = "User not found" });
                }
                tweetResponse.User = user.AsDtoTweetComment();
                tweetResponse.RefTweet = refTweet.AsDto();
                tweetResponse.RefTweet.User = tweetOwner.AsDtoTweetComment();

                CacheNotificationConsumerDto cacheNotificationConsumerDto = new CacheNotificationConsumerDto
                {
                    Type = "Create Retweet",
                    IsNotification = true,
                    Notification = new NotificationCreateDto
                    {
                        UserId = refTweet.UserId,
                        RefUserId = userId,
                        TweetId = tweet.Id,
                        Type = "Retweet",
                    },
                    Tweet = tweetResponse,
                };
                await _bus.Publish(cacheNotificationConsumerDto);

                return Ok(tweetResponse);
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
            User? userModel = await _usersService.GetUserAsync(tweet.UserId);
            if (userModel == null || userModel.DeletedAt != null || userModel.BlockedAt != null)
            {
                return NotFound(new { message = "Retweet owner not found" });
            }
            TweetCommentUserResponseDto? user = userModel.AsDtoTweetComment();
            tweetResponse.User = user;
            LikedOrRetweetedDto likedOrRetweet = await _iLikeCommentService.IsLikedOrRetweeted(id);
            tweetResponse.IsLiked = likedOrRetweet.IsLiked;
            tweetResponse.IsRetweeted = likedOrRetweet.IsRetweeted;
            if (tweet.Type == "Retweet")
            {
                Tweets? refTweet = await _tweetService.GetTweetById(tweet.RetweetRefId);
                if (refTweet != null)
                {
                    User? refUser = await _usersService.GetUserAsync(refTweet.UserId);
                    if (refUser != null && refUser.DeletedAt == null && refUser.BlockedAt == null)
                    {
                        tweetResponse.RefTweet = refTweet.AsDto();
                        tweetResponse.RefTweet.User = refUser.AsDtoTweetComment();
                    }
                }
            }
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
            if (tweet.Type == "Retweet")
            {
                return BadRequest(new
                {
                    Message = "Retweet cannot be updated here",
                });
            }
            User? user = await _usersService.GetUserAsync(tweet.UserId);

            if (user == null || user.DeletedAt != null || user.BlockedAt != null || user.Id != tweet.UserId)
            {
                return Unauthorized(new { message = "User not found" });
            }
            await _tweetService.UpdateTweet(tweet, tweetRequest);
            TweetResponseDto tweetResponse = tweet.AsDto();
            tweetResponse.User = user.AsDtoTweetComment();
            LikedOrRetweetedDto likedOrRetweet = await _iLikeCommentService.IsLikedOrRetweeted(id);
            tweetResponse.IsLiked = likedOrRetweet.IsLiked;
            tweetResponse.IsRetweeted = likedOrRetweet.IsRetweeted;
            return Ok(tweetResponse);
        }

        [HttpPut("retweet/{id}"), Authorize]
        public async Task<ActionResult<TweetResponseDto>> UpdateRetweet(string id, RetweetRequestDto tweetRequest)
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }
            var tweet = await _tweetService.GetTweetById(id);
            if (tweet == null)
            {
                return NotFound(new
                {
                    Message = "Tweet Not Found",
                });
            }
            if (tweet.Type != "Retweet")
            {
                return BadRequest(new
                {
                    Message = "Tweet is not a retweet",
                });
            }
            User? user = await _usersService.GetUserAsync(userId);
            if (user == null || user.DeletedAt != null || user.BlockedAt != null || user.Id != tweet.UserId)
            {
                return Unauthorized(new { message = "User not found" });
            }
            await _tweetService.UpdateRetweet(tweet, tweetRequest);
            TweetResponseDto tweetResponse = tweet.AsDto();
            LikedOrRetweetedDto likedOrRetweet = await _iLikeCommentService.IsLikedOrRetweeted(id);
            tweetResponse.IsLiked = likedOrRetweet.IsLiked;
            tweetResponse.IsRetweeted = likedOrRetweet.IsRetweeted;


            Tweets? refTweet = await _tweetService.GetTweetById(tweet.RetweetRefId);
            if (refTweet != null)
            {
                User? refUser = await _usersService.GetUserAsync(refTweet.UserId);
                if (refUser != null && refUser.DeletedAt == null && refUser.BlockedAt == null)
                {
                    tweetResponse.RefTweet = refTweet.AsDto();
                    tweetResponse.RefTweet.User = refUser.AsDtoTweetComment();
                }
            }
            return Ok(tweetResponse);
        }

        [HttpDelete("{id}"), Authorize]
        public async Task<ActionResult<object>> DeleteTweet(string id)
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }
            var tweet = await _tweetService.GetTweetById(id);
            if (tweet == null)
            {
                return NotFound(new
                {
                    Message = "Tweet Not Found",
                });
            }
            User? user = await _usersService.GetUserAsync(userId);
            if (user == null || user.DeletedAt != null || user.BlockedAt != null || user.Id != tweet.UserId)
            {
                return Unauthorized();
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
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }
            User? user = await _usersService.GetUserAsync(userId);
            if (user == null || user.DeletedAt != null || user.BlockedAt != null)
            {
                return Unauthorized();
            }
            var tweet = await _tweetService.GetTweetById(tweetId);
            if (tweet == null)
            {
                return NotFound(new
                {
                    Message = "Tweet Not Found",
                });
            }
            string msg = await _iLikeCommentService.LikeTweet(tweet, userId);
            if (msg == "Tweet liked")
            {
                CacheNotificationConsumerDto cacheNotificationConsumerDto = new CacheNotificationConsumerDto
                {
                    Type = "Notification",
                    IsNotification = true,
                    Notification = new NotificationCreateDto
                    {
                        UserId = tweet.UserId,
                        RefUserId = userId,
                        TweetId = tweet.Id,
                        Type = "Like",
                    }
                };
                await _bus.Publish(cacheNotificationConsumerDto);
            }

            return Ok(new { Message = msg });

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
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }
            User? user = await _usersService.GetUserAsync(userId);
            if (user == null || user.DeletedAt != null || user.BlockedAt != null)
            {
                return Unauthorized();
            }
            var tweet = await _tweetService.GetTweetById(tweetId);
            if (tweet == null)
            {
                return NotFound(new
                {
                    Message = "Tweet Not Found",
                });
            }
            CommentResponseDto? comment = await _iLikeCommentService.Comment(userId, tweet, commentRequest.Comment);
            if (comment == null)
            {
                return BadRequest(new { Message = "Something went wrong" });
            }
            comment.User = user.AsDtoTweetComment();


            // publish to RabbitMQ start
            CacheNotificationConsumerDto cacheNotificationConsumerDto = new CacheNotificationConsumerDto
            {
                Type = "Notification",
                IsNotification = true,
                Notification = new NotificationCreateDto
                {
                    UserId = tweet.UserId,
                    RefUserId = userId,
                    TweetId = tweet.Id,
                    Type = "Comment",
                }
            };
            await _bus.Publish(cacheNotificationConsumerDto);
            // publish to RabbitMQ end

            return Ok(comment);
        }

        [HttpDelete("comment/{commentId}"), Authorize]
        public async Task<ActionResult<object>> DeleteComment(string commentId)
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }
            User? user = await _usersService.GetUserAsync(userId);
            if (user == null || user.DeletedAt != null || user.BlockedAt != null)
            {
                return Unauthorized();
            }
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
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }
            User? user = await _usersService.GetUserAsync(userId);
            if (user == null || user.DeletedAt != null || user.BlockedAt != null)
            {
                return Unauthorized();
            }
            CommentResponseDto? comment = await _iLikeCommentService.UpdateComment(commentId, commentRequest.Comment);
            if (comment == null)
            {
                return BadRequest(new { Message = "Something went wrong" });
            }
            return Ok(comment);
        }

        [HttpGet("comments/{tweetId}"), Authorize]
        public async Task<ActionResult<PaginatedCommentResponseDto>> GetComments(string tweetId, [FromQuery] int size = 5, [FromQuery] int page = 0)
        {
            PaginatedCommentResponseDto comments = await _iLikeCommentService.GetComments(size, page, tweetId);
            return Ok(comments);
        }


    }
}