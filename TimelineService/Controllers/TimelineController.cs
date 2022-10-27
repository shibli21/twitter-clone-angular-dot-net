using System.Security.Claims;
using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using StackExchange.Redis;

namespace TimelineService.Controllers
{
    [Route("")]
    [ApiController]
    public class TimelineController : ControllerBase
    {
        private readonly ITweetService _tweetService;
        private readonly IUsersService _usersService;
        private readonly IBlockService _blockService;
        private readonly ILikeCommentService _iLikeCommentService;
        private readonly ITimeLineService _iTimeLineService;
        private readonly IConnectionMultiplexer _connectionMultiplexer;
        private readonly IDatabase _database;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public TimelineController(IHttpContextAccessor httpContextAccessor, ITweetService tweetService, ILikeCommentService iLikeCommentService, IUsersService usersService, ITimeLineService iTimeLineService, IConnectionMultiplexer connectionMultiplexer, IBlockService blockService)
        {
            _tweetService = tweetService;
            _iLikeCommentService = iLikeCommentService;
            _usersService = usersService;
            _iTimeLineService = iTimeLineService;
            _connectionMultiplexer = connectionMultiplexer;
            _database = _connectionMultiplexer.GetDatabase();
            _httpContextAccessor = httpContextAccessor;
            _blockService = blockService;
        }
        [HttpGet("user-timeline/{userId}"), Authorize]
        public async Task<ActionResult<PaginatedTweetResponseDto>> GetUserTweets(string userId, [FromQuery] int size = 20, [FromQuery] int page = 0)
        {
            var authUserId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (authUserId == null)
            {
                return Unauthorized();
            }
            User? userModel = await _usersService.GetUserAsync(userId);
            if (userModel == null || userModel.DeletedAt != null || userModel.BlockedAt != null)
            {
                return NotFound(new { Message = "User Not Found" });
            }
            PaginatedTweetResponseDto? tweets;
            if (page == 0 && authUserId == userId)
            {
                string? resJson = await _database.StringGetAsync("noobmasters_timeline_" + userId);
                if (resJson != null)
                {
                    tweets = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(resJson);
                    if (tweets != null)
                    {
                        if (tweets.Tweets != null && tweets.Tweets.Count > 0)
                        {
                            tweets.Tweets = tweets.Tweets.Take(size).ToList();
                            return Ok(tweets);
                        }

                    }
                }
            }


            TweetCommentUserResponseDto user = userModel.AsDtoTweetComment();

            tweets = await _iTimeLineService.GetUserTimeLine(userId, size, page);
            if (tweets.Tweets != null)
            {
                foreach (TweetResponseDto tweet in tweets.Tweets)
                {
                    tweet.User = user;
                    LikedOrRetweetedDto likedOrRetweet = await _iLikeCommentService.IsLikedOrRetweeted(tweet.Id);
                    tweet.IsLiked = likedOrRetweet.IsLiked;
                    tweet.IsRetweeted = likedOrRetweet.IsRetweeted;
                    if (tweet.Type == "Retweet" && tweet.RetweetRefId != null)
                    {
                        Tweets? refTweet = await _tweetService.GetTweetById(tweet.RetweetRefId);
                        if (refTweet != null)
                        {
                            User? refUser = await _usersService.GetUserAsync(refTweet.UserId);
                            if (refUser != null && refUser.DeletedAt == null && refUser.BlockedAt == null)
                            {
                                tweet.RefTweet = refTweet.AsDto();
                                tweet.RefTweet.User = refUser.AsDtoTweetComment();
                            }
                        }
                    }
                }
            }
            if (page == 0 && authUserId == userId)
            {
                string resJson = JsonConvert.SerializeObject(tweets);
                await _database.StringSetAsync("noobmasters_timeline_" + userId, resJson, TimeSpan.FromMinutes(60));
            }
            return Ok(tweets);
        }

        [HttpGet("news-feed"), Authorize]
        public async Task<ActionResult<PaginatedTweetResponseDto>> GetNewsFeed([FromQuery] int size = 20, [FromQuery] int page = 0)
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }
            PaginatedTweetResponseDto? tweets;
            if (page == 0)
            {
                string? resJson = await _database.StringGetAsync("noobmasters_newsfeed_" + userId);
                if (resJson != null)
                {
                    tweets = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(resJson);
                    if (tweets != null)
                    {
                        if (tweets.Tweets != null && tweets.Tweets.Count > 0)
                        {
                            tweets.Tweets = tweets.Tweets.Take(size).ToList();
                            return Ok(tweets);
                        }

                    }
                }
            }
            tweets = await _iTimeLineService.GetNewsFeed(userId, size, page);
            if (tweets.Tweets != null)
            {


                string[] blockedIds = await _blockService.GetBlockedUsersIds(userId);

                foreach (TweetResponseDto tweet in tweets.Tweets)
                {
                    tweet.User = (await _usersService.GetUserAsync(tweet.UserId))?.AsDtoTweetComment();
                    LikedOrRetweetedDto likedOrRetweet = await _iLikeCommentService.IsLikedOrRetweeted(tweet.Id);
                    tweet.IsLiked = likedOrRetweet.IsLiked;
                    tweet.IsRetweeted = likedOrRetweet.IsRetweeted;
                    if (tweet.Type == "Retweet" && tweet.RetweetRefId != null)
                    {
                        Tweets? refTweet = await _tweetService.GetTweetById(tweet.RetweetRefId);
                        if (refTweet != null)
                        {
                            User? refUser = await _usersService.GetUserAsync(refTweet.UserId);
                            if (refUser != null && refUser.DeletedAt == null && refUser.BlockedAt == null && !blockedIds.Contains(refUser.Id))
                            {
                                tweet.RefTweet = refTweet.AsDto();
                                tweet.RefTweet.User = refUser.AsDtoTweetComment();
                            }
                        }
                    }
                }
            }
            if (page == 0)
            {
                string resJson = JsonConvert.SerializeObject(tweets);
                await _database.StringSetAsync("noobmasters_newsfeed_" + userId, resJson, TimeSpan.FromMinutes(60));
            }
            return Ok(tweets);
        }

    }
}