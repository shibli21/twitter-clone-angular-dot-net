
using Core.Dtos;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SearchService.Controllers;

[ApiController]
[Route("[controller]")]
public class SearchController : ControllerBase
{
    private readonly ISearchingService _searchService;

    public SearchController(ISearchingService searchService)
    {
        _searchService = searchService;
    }

    [HttpGet("search-users"), Authorize]
    public async Task<ActionResult<PaginatedSearchedUserResponseDto>> SearchUser([FromQuery] string searchQuery, [FromQuery] int page = 0, [FromQuery] int limit = 20)
    {
        return Ok(await _searchService.SearchUsersAsync(searchQuery, page, limit));
    }

    [HttpGet("search-tweets"), Authorize]
    public async Task<ActionResult<PaginatedTweetResponseDto>> SearchTweet([FromQuery] string searchQuery, [FromQuery] int page = 0, [FromQuery] int limit = 20)
    {
        return Ok(await _searchService.SearchTweetAsync(searchQuery, page, limit));
    }


    [HttpGet("hashtag-suggestion"), Authorize]
    public async Task<ActionResult<PaginatedTagsResponseDto>> HashTagSuggestion([FromQuery] string searchQuery, [FromQuery] int page = 0, [FromQuery] int limit = 20)
    {
        return Ok(await _searchService.HashTagSuggestionAsync(searchQuery, page, limit));
    }

}