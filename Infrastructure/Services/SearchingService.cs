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
    public class SearchingService : ISearchingService
    {
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMongoCollection<Follows> _followCollection;
        private readonly IMongoCollection<Blocks> _blockCollection;
        private readonly IMongoCollection<HashTags> _hashTagCollection;
        private readonly IMongoCollection<Tweets> _tweetCollection;
        private IHttpContextAccessor _httpContextAccessor;

        public SearchingService(IOptions<TwitterCloneDbConfig> twitterCloneDatabaseSettings,
        IMongoClient mongoClient, IHttpContextAccessor httpContextAccessor)
        {
            var mongoDatabase = mongoClient.GetDatabase(twitterCloneDatabaseSettings.Value.DatabaseName);
            _usersCollection = mongoDatabase.GetCollection<User>(twitterCloneDatabaseSettings.Value.UserCollectionName);
            _followCollection = mongoDatabase.GetCollection<Follows>(twitterCloneDatabaseSettings.Value.FollowerCollectionName);
            _blockCollection = mongoDatabase.GetCollection<Blocks>(twitterCloneDatabaseSettings.Value.BlockCollectionName);
            _hashTagCollection = mongoDatabase.GetCollection<HashTags>(twitterCloneDatabaseSettings.Value.HashTagCollectionName);
            _tweetCollection = mongoDatabase.GetCollection<Tweets>(twitterCloneDatabaseSettings.Value.TweetCollectionName);
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<PaginatedTweetResponseDto> SearchTweetAsync(string searchQuery, int page, int limit)
        {
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId != null)
                {
                    var filter = _hashTagCollection.Find(x => x.HashTag.Contains(searchQuery));
                    var totalElements = await filter.CountDocumentsAsync();
                    int LastPage = (int)Math.Ceiling((double)totalElements / limit) - 1;
                    LastPage = LastPage < 0 ? 0 : LastPage;
                    var tweetIds = (await filter.Skip((page) * limit)
                        .Limit(limit).ToListAsync()).Select(x => x.TweetId).Distinct().ToArray();

                    var blocked = await _blockCollection.Find(block => block.UserId == userId || block.BlockedUserId == userId).ToListAsync();
                    var blockedMeIds = blocked.Where(block => block.BlockedUserId == userId).Select(block => block.UserId).ToList();
                    var myBlockedIds = blocked.Where(block => block.UserId == userId).Select(block => block.BlockedUserId).ToList();
                    var blockedIds = blockedMeIds.Concat(myBlockedIds).ToList();

                    var tweets = await _tweetCollection.Find(tweet => tweetIds.Contains(tweet.Id) && tweet.DeletedAt == null && !blockedIds.Contains(tweet.UserId)).ToListAsync();
                    
                    return new PaginatedTweetResponseDto()
                    {
                        TotalElements = totalElements,
                        Page = page,
                        Size = limit,
                        LastPage = LastPage,
                        TotalPages = LastPage + 1,
                        Tweets = tweets.Select(tweet => tweet.AsDto()).ToList()
                    };
                }
            }
            return new PaginatedTweetResponseDto();
        }

        public async Task<PaginatedSearchedUserResponseDto> SearchUsersAsync(string searchQuery, int page, int limit)
        {
            if (_httpContextAccessor.HttpContext != null)
            {
                string? id = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (id != null)
                {
                    var following = await _followCollection.Find(follow => follow.UserId == id).ToListAsync();
                    var followingIds = following.Select(follow => follow.FollowingId).ToList();
                    var blocked = await _blockCollection.Find(block => block.UserId == id || block.BlockedUserId == id).ToListAsync();
                    var blockedMeIds = blocked.Where(block => block.BlockedUserId == id).Select(block => block.UserId).ToList();
                    var myBlockedIds = blocked.Where(block => block.UserId == id).Select(block => block.BlockedUserId).ToList();
                    var blockedIds = blockedMeIds.Concat(myBlockedIds).ToList();
                    var filter = _usersCollection.Find(user => (user.UserName.Contains(searchQuery) || user.FirstName.Contains(searchQuery) || user.LastName.Contains(searchQuery)) && user.Id != id && !blockedIds.Contains(user.Id) && user.DeletedAt == null && user.BlockedAt == null);
                    long totalElements = await filter.CountDocumentsAsync();
                    int lastPage = (int)Math.Ceiling((double)totalElements / limit) - 1;
                    lastPage = lastPage < 0 ? 0 : lastPage;
                    
                    int totalPages = lastPage + 1;
                    List<SearchedUserResponseDto> users = (await filter.Skip((page) * limit)
                        .Limit(limit)
                        .ToListAsync()).Select(user => user.AsDtoSearchedUser()).ToList();
                    foreach (SearchedUserResponseDto user in users)
                    {
                        if (followingIds.Contains(user.Id))
                        {
                            user.IsFollowed = true;
                        }
                    }
                    return new PaginatedSearchedUserResponseDto
                    {
                        TotalElements = totalElements,
                        Page = page,
                        Size = limit,
                        LastPage = lastPage,
                        TotalPages = totalPages,
                        Users = users
                    };

                }
            }
            return new PaginatedSearchedUserResponseDto();


        }
    }
}