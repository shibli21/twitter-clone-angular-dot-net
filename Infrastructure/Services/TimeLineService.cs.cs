using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Infrastructure.Services
{
    public class TimeLineService : ITimeLineService
    {

        private readonly IMongoCollection<Follows> _followCollection;
        private readonly IMongoCollection<Tweets> _tweetCollection;
        private readonly IMongoCollection<User> _userCollection;
        public TimeLineService(IOptions<TwitterCloneDbConfig> twitterCloneDatabaseSettings,
        IMongoClient mongoClient)
        {
            var mongoDatabase = mongoClient.GetDatabase(twitterCloneDatabaseSettings.Value.DatabaseName);
            _tweetCollection = mongoDatabase.GetCollection<Tweets>(twitterCloneDatabaseSettings.Value.TweetCollectionName);
            _followCollection = mongoDatabase.GetCollection<Follows>(twitterCloneDatabaseSettings.Value.FollowerCollectionName);
            _userCollection = mongoDatabase.GetCollection<User>(twitterCloneDatabaseSettings.Value.UserCollectionName);
        }

        public async Task<PaginatedTweetResponseDto> GetNewsFeed(string userId, int size, int page)
        {
            string[] followingIds = (await _followCollection.Find(f => f.UserId == userId).ToListAsync()).Select(f => f.FollowingId).ToArray();
            string[] adminBlockIds = (await _userCollection.Find(u => u.BlockedAt !=null).ToListAsync()).Select(u => u.Id).ToArray();
            followingIds = followingIds.Except(adminBlockIds).ToArray();
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