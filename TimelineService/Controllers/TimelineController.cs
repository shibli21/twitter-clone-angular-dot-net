using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TimelineService.Controllers
{
    [Route("")]
    [ApiController]
    public class TimelineController : ControllerBase
    {
        private readonly ITweetService _tweetService;
        private readonly IUsersService _usersService;
        private readonly ILikeCommentService _iLikeCommentService;
        private readonly ITimeLineService _iTimeLineService;
        public TimelineController(ITweetService tweetService, ILikeCommentService iLikeCommentService, IUsersService usersService, ITimeLineService iTimeLineService)
        {
            _tweetService = tweetService;
            _iLikeCommentService = iLikeCommentService;
            _usersService = usersService;
            _iTimeLineService = iTimeLineService;
        }
        [HttpGet("user-timeline/{userId}"), Authorize]
        public async Task<ActionResult<PaginatedTweetResponseDto>> GetUserTweets(string userId, [FromQuery] int size = 20, [FromQuery] int page = 0)
        {
            User? userModel = await _usersService.GetUserAsync(userId);
            if (userModel == null || userModel.DeletedAt != null || userModel.BlockedAt != null)
            {
                return NotFound(new { Message = "User Not Found" });
            }
            TweetCommentUserResponseDto user = userModel.AsDtoTweetComment();

            PaginatedTweetResponseDto tweets = await _iTimeLineService.GetUserTimeLine(userId, size, page);
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
            return Ok(tweets);
        }

        [HttpGet("news-feed"), Authorize]
        public async Task<ActionResult<PaginatedTweetResponseDto>> GetNewsFeed([FromQuery] int size = 20, [FromQuery] int page = 0)
        {
            PaginatedTweetResponseDto tweets = await _iTimeLineService.GetNewsFeed(size, page);
            if (tweets.Tweets != null)
            {
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
                            if (refUser != null && refUser.DeletedAt == null && refUser.BlockedAt == null)
                            {
                                tweet.RefTweet = refTweet.AsDto();
                                tweet.RefTweet.User = refUser.AsDtoTweetComment();
                            }
                        }
                    }
                }
            }
            return Ok(tweets);
        }

    }
}