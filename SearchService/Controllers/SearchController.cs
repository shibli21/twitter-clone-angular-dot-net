
using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SearchService.Controllers;

[ApiController]
[Route("[controller]")]
public class SearchController : ControllerBase
{
    private readonly ISearchingService _searchService;
    private readonly ITweetService _tweetService;
    private readonly IUsersService _usersService;
    private readonly ILikeCommentService _iLikeCommentService;

    public SearchController(ISearchingService searchService, ITweetService tweetService, ILikeCommentService iLikeCommentService, IUsersService usersService)
    {
        _searchService = searchService;
        _tweetService = tweetService;
        _iLikeCommentService = iLikeCommentService;
        _usersService = usersService;
    }

    [HttpGet("search-users"), Authorize]
    public async Task<ActionResult<PaginatedSearchedUserResponseDto>> SearchUser([FromQuery] string searchQuery, [FromQuery] int page = 0, [FromQuery] int limit = 20)
    {
        return Ok(await _searchService.SearchUsersAsync(searchQuery, page, limit));
    }

    [HttpGet("search-tweets"), Authorize]
    public async Task<ActionResult<PaginatedTweetResponseDto>> SearchTweet([FromQuery] string searchQuery, [FromQuery] int page = 0, [FromQuery] int limit = 20)
    {
        PaginatedTweetResponseDto tweets = await _searchService.SearchTweetAsync(searchQuery, page, limit);
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
                        tweet.RefTweet = refTweet.AsDto();
                        tweet.RefTweet.User = (await _usersService.GetUserAsync(refTweet.UserId))?.AsDtoTweetComment();
                    }
                }
            }
        }
        return Ok(tweets);
    }

}