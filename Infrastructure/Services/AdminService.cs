using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Infrastructure.Services
{
    public class AdminService : IAdminService
    {

        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMongoCollection<Tweets> _tweetCollection;
        public AdminService(IOptions<TwitterCloneDbConfig> twitterCloneDatabaseSettings, IMongoClient mongoClient)
        {
            var mongoDatabase = mongoClient.GetDatabase(twitterCloneDatabaseSettings.Value.DatabaseName);
            _usersCollection = mongoDatabase.GetCollection<User>(twitterCloneDatabaseSettings.Value.UserCollectionName);
            _tweetCollection = mongoDatabase.GetCollection<Tweets>(twitterCloneDatabaseSettings.Value.TweetCollectionName);
        }
        public async Task<DashboardDto> GetDashboard()
        {
            DashboardDto dashboardDto = new DashboardDto();
            dashboardDto.TotalTweets = await _tweetCollection.CountDocumentsAsync(tweet => tweet.DeletedAt == null);
            dashboardDto.TotalRetweets = await _tweetCollection.CountDocumentsAsync(tweet => tweet.Type == "retweet" && tweet.DeletedAt == null);
            dashboardDto.TotalUsers = await _usersCollection.CountDocumentsAsync(user => user.DeletedAt == null && user.Role == "user" && user.BlockedAt == null);
            dashboardDto.TotalBlockedUsers = await _usersCollection.CountDocumentsAsync(user => user.BlockedAt != null);
            var today = DateTime.Today;
            dashboardDto.TodaysTweets = await _tweetCollection.CountDocumentsAsync(tweet => tweet.CreatedAt >= today && tweet.DeletedAt == null);
            dashboardDto.TodaysRetweets = await _tweetCollection.CountDocumentsAsync(tweet => tweet.Type == "retweet" && tweet.CreatedAt >= today && tweet.DeletedAt == null);
            dashboardDto.TodaysUsers = await _usersCollection.CountDocumentsAsync(user => user.CreatedAt >= today && user.DeletedAt == null && user.Role == "user" && user.BlockedAt == null);
            dashboardDto.TodaysBlockedUsers = await _usersCollection.CountDocumentsAsync(user => user.BlockedAt != null && user.BlockedAt.Value >= today);
            return dashboardDto;
        }
    }
}