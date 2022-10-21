using System.Security.Claims;
using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Config;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Infrastructure.Services
{
    public class TimeLineService : ITimeLineService
    {

        private readonly IMongoCollection<Follows> _followCollection;
        private readonly IMongoCollection<Tweets> _tweetCollection;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public TimeLineService(IOptions<TwitterCloneDbConfig> twitterCloneDatabaseSettings,
        IMongoClient mongoClient,
        IHttpContextAccessor httpContextAccessor)
        {
            var mongoDatabase = mongoClient.GetDatabase(twitterCloneDatabaseSettings.Value.DatabaseName);
            _tweetCollection = mongoDatabase.GetCollection<Tweets>(twitterCloneDatabaseSettings.Value.TweetCollectionName);
            _followCollection = mongoDatabase.GetCollection<Follows>(twitterCloneDatabaseSettings.Value.FollowerCollectionName);
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PaginatedTweetResponseDto> GetNewsFeed(int size, int page)
        {
            PaginatedTweetResponseDto paginatedTweetResponseDto = new PaginatedTweetResponseDto();
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId != null)
                {
                    string[] followingIds = (await _followCollection.Find(f => f.UserId == userId).ToListAsync()).Select(f => f.FollowingId).ToArray();
                    var filter = _tweetCollection.Find(t => followingIds.Contains(t.UserId) && t.DeletedAt == null).SortByDescending(t => t.CreatedAt);
                    int LastPage = (int)Math.Ceiling((double)await filter.CountDocumentsAsync() / size) - 1;
                    LastPage = LastPage < 0 ? 0 : LastPage;
                    return new PaginatedTweetResponseDto()
                    {
                        TotalElements = await filter.CountDocumentsAsync(),
                        Page = page,
                        Size = size,
                        LastPage = LastPage,
                        TotalPages = (int)Math.Ceiling((double)await filter.CountDocumentsAsync() / size),
                        Tweets = await filter.Skip((page) * size)
                                            .Limit(size)
                                            .Project(tweet => tweet.AsDto())
                                            .ToListAsync()
                    };


                }
            }
            return paginatedTweetResponseDto;
        }

        public async Task<PaginatedTweetResponseDto> GetUserTimeLine(string userId, int size, int page)
        {
            var filter = _tweetCollection.Find(tweet => tweet.UserId == userId && tweet.DeletedAt == null).SortByDescending(tweet => tweet.CreatedAt);
            int LastPage = (int)Math.Ceiling((double)await filter.CountDocumentsAsync() / size) - 1;
            LastPage = LastPage < 0 ? 0 : LastPage;
            return new PaginatedTweetResponseDto()
            {
                TotalElements = await filter.CountDocumentsAsync(),
                Page = page,
                Size = size,
                LastPage = LastPage,
                TotalPages = (int)Math.Ceiling((double)await filter.CountDocumentsAsync() / size),
                Tweets = await filter.Skip((page) * size)
                                    .Limit(size)
                                    .Project(tweet => tweet.AsDto())
                                    .ToListAsync()
            };
        }
    }
}