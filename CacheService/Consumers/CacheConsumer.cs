using Core.Dtos;
using Core.Models;
using Infrastructure.Config;
using MassTransit;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Newtonsoft.Json;
using StackExchange.Redis;

namespace CacheService.Consumers
{
    public class CacheConsumer : IConsumer<CacheNotificationConsumerDto>
    {
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMongoCollection<Follows> _followCollection;
        private readonly IMongoCollection<Tweets> _tweetCollection;
        private readonly IConnectionMultiplexer _connectionMultiplexer;
        private readonly IDatabase _database;
        private readonly TwitterCloneRedisConfig _redisConfig;
        private int cacheTime = 60;
        public CacheConsumer(IOptions<TwitterCloneDbConfig> twitterCloneDbConfig, IMongoClient mongoClient, IOptions<TwitterCloneRedisConfig> twitterCloneRedisSettings, IConnectionMultiplexer connectionMultiplexer)
        {
            var mongoDatabase = mongoClient.GetDatabase(twitterCloneDbConfig.Value.DatabaseName);
            _usersCollection = mongoDatabase.GetCollection<User>(twitterCloneDbConfig.Value.UserCollectionName);
            _followCollection = mongoDatabase.GetCollection<Follows>(twitterCloneDbConfig.Value.FollowerCollectionName);
            _tweetCollection = mongoDatabase.GetCollection<Tweets>(twitterCloneDbConfig.Value.TweetCollectionName); _connectionMultiplexer = connectionMultiplexer;
            _database = _connectionMultiplexer.GetDatabase();
            _redisConfig = twitterCloneRedisSettings.Value;

        }
        public async Task Consume(ConsumeContext<CacheNotificationConsumerDto> context)
        {
            CacheNotificationConsumerDto cacheNotificationConsumerDto = context.Message;
            if (cacheNotificationConsumerDto.Type == "Create Tweet")
                CreateTweet(cacheNotificationConsumerDto);
            else if (cacheNotificationConsumerDto.Type == "Create Retweet")
                CreateRetweet(cacheNotificationConsumerDto);
            else if (cacheNotificationConsumerDto.Type == "Update")
                UpdateTweet(cacheNotificationConsumerDto);
            else if (cacheNotificationConsumerDto.Type == "Delete")
                DeleteTweet(cacheNotificationConsumerDto);
            else if (cacheNotificationConsumerDto.Type == "Like" || cacheNotificationConsumerDto.Type == "Unlike"
                || cacheNotificationConsumerDto.Type == "Comment" || cacheNotificationConsumerDto.Type == "Delete Comment")
                LikeCommentTweet(cacheNotificationConsumerDto);
            else if (cacheNotificationConsumerDto.Type == "Block by user")
                BlockByUser(cacheNotificationConsumerDto);
            else if (cacheNotificationConsumerDto.Type == "Block by admin")
                BlockByAdmin(cacheNotificationConsumerDto);
            else if (cacheNotificationConsumerDto.Type == "Unfollow")
                Unfollow(cacheNotificationConsumerDto);

            await Task.CompletedTask;
        }

        private async void CreateTweet(CacheNotificationConsumerDto cacheNotificationConsumerDto)
        {
            if (cacheNotificationConsumerDto.Tweet != null)
            {
                // Updating NewsFeed of followers
                var followers = await _followCollection.Find(f => f.FollowingId == cacheNotificationConsumerDto.Tweet.UserId).ToListAsync();
                foreach (var follower in followers)
                {
                    string? resJson = await _database.StringGetAsync("noobmasters_newsfeed_" + follower.UserId);
                    if (resJson != null)
                    {
                        PaginatedTweetResponseDto? newsfeed = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(resJson);
                        if (newsfeed != null && newsfeed.Tweets != null)
                        {
                            newsfeed.TotalElements += 1;
                            newsfeed.LastPage = (int)Math.Ceiling((double)newsfeed.TotalElements / newsfeed.Size) - 1;
                            newsfeed.LastPage = newsfeed.LastPage < 0 ? 0 : newsfeed.LastPage;
                            newsfeed.TotalPages = (int)Math.Ceiling((double)newsfeed.TotalElements / newsfeed.Size);
                            newsfeed.Tweets.Insert(0, cacheNotificationConsumerDto.Tweet);
                            if (newsfeed.Tweets.Count > newsfeed.Size + 10)
                                newsfeed.Tweets.RemoveRange(newsfeed.Size + 10, newsfeed.Tweets.Count - newsfeed.Size - 10);
                            await _database.StringSetAsync("noobmasters_newsfeed_" + follower.UserId, JsonConvert.SerializeObject(newsfeed), TimeSpan.FromMinutes(cacheTime));
                        }
                    }
                }
                // Updating Timeline of user
                string? timelineJson = await _database.StringGetAsync("noobmasters_timeline_" + cacheNotificationConsumerDto.Tweet.UserId);
                if (timelineJson != null)
                {
                    PaginatedTweetResponseDto? timeline = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(timelineJson);
                    if (timeline != null && timeline.Tweets != null)
                    {
                        timeline.TotalElements += 1;
                        timeline.LastPage = (int)Math.Ceiling((double)timeline.TotalElements / timeline.Size) - 1;
                        timeline.LastPage = timeline.LastPage < 0 ? 0 : timeline.LastPage;
                        timeline.TotalPages = (int)Math.Ceiling((double)timeline.TotalElements / timeline.Size);
                        timeline.Tweets.Insert(0, cacheNotificationConsumerDto.Tweet);

                        if (timeline.Tweets.Count > timeline.Size + 10)
                            timeline.Tweets.RemoveRange(timeline.Size + 10, timeline.Tweets.Count - timeline.Size - 10);
                        await _database.StringSetAsync("noobmasters_timeline_" + cacheNotificationConsumerDto.Tweet.UserId, JsonConvert.SerializeObject(timeline), TimeSpan.FromMinutes(cacheTime));
                    }
                }
            }
        }
        private async void CreateRetweet(CacheNotificationConsumerDto cacheNotificationConsumerDto)
        {
            if (cacheNotificationConsumerDto.Tweet != null)
            {
                // Updating NewsFeed of followers
                var followers = await _followCollection.Find(f => f.FollowingId == cacheNotificationConsumerDto.Tweet.UserId).ToListAsync();
                foreach (var follower in followers)
                {
                    string? resJson = await _database.StringGetAsync("noobmasters_newsfeed_" + follower.UserId);
                    if (resJson != null)
                    {
                        PaginatedTweetResponseDto? newsfeed = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(resJson);
                        if (newsfeed != null && newsfeed.Tweets != null)
                        {
                            newsfeed.TotalElements += 1;
                            newsfeed.LastPage = (int)Math.Ceiling((double)newsfeed.TotalElements / newsfeed.Size) - 1;
                            newsfeed.LastPage = newsfeed.LastPage < 0 ? 0 : newsfeed.LastPage;
                            newsfeed.TotalPages = (int)Math.Ceiling((double)newsfeed.TotalElements / newsfeed.Size);
                            newsfeed.Tweets.Insert(0, cacheNotificationConsumerDto.Tweet);
                            if (newsfeed.Tweets.Count > newsfeed.Size + 10)
                                newsfeed.Tweets.RemoveRange(newsfeed.Size + 10, newsfeed.Tweets.Count - newsfeed.Size - 10);
                            await _database.StringSetAsync("noobmasters_newsfeed_" + follower.UserId, JsonConvert.SerializeObject(newsfeed), TimeSpan.FromMinutes(cacheTime));
                        }
                    }
                }
                // Updating Timeline of user
                string? timelineJson = await _database.StringGetAsync("noobmasters_timeline_" + cacheNotificationConsumerDto.Tweet.UserId);
                if (timelineJson != null)
                {
                    PaginatedTweetResponseDto? timeline = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(timelineJson);
                    if (timeline != null && timeline.Tweets != null)
                    {
                        timeline.TotalElements += 1;
                        timeline.LastPage = (int)Math.Ceiling((double)timeline.TotalElements / timeline.Size) - 1;
                        timeline.LastPage = timeline.LastPage < 0 ? 0 : timeline.LastPage;
                        timeline.TotalPages = (int)Math.Ceiling((double)timeline.TotalElements / timeline.Size);
                        timeline.Tweets.Insert(0, cacheNotificationConsumerDto.Tweet);
                        if (timeline.Tweets.Count > timeline.Size + 10)
                            timeline.Tweets.RemoveRange(timeline.Size + 10, timeline.Tweets.Count - timeline.Size - 10);
                        await _database.StringSetAsync("noobmasters_timeline_" + cacheNotificationConsumerDto.Tweet.UserId, JsonConvert.SerializeObject(timeline), TimeSpan.FromMinutes(cacheTime));
                    }
                }
                // Updating ref tweet
                TweetResponseDto? refTweet = cacheNotificationConsumerDto.Tweet.RefTweet;
                if (refTweet != null)
                {
                    CacheNotificationConsumerDto cacheNotificationConsumerDtoRefTweet = new CacheNotificationConsumerDto
                    {
                        Tweet = refTweet,
                        Type = "UpdateRetweet"
                    };
                    UpdateTweet(cacheNotificationConsumerDtoRefTweet);
                }
            }
        }

        private async void UpdateTweet(CacheNotificationConsumerDto cacheNotificationConsumerDto)
        {
            if (cacheNotificationConsumerDto.Tweet != null)
            {
                // Updating NewsFeed of followers
                var followers = await _followCollection.Find(f => f.FollowingId == cacheNotificationConsumerDto.Tweet.UserId).ToListAsync();
                foreach (var follower in followers)
                {
                    string? resJson = await _database.StringGetAsync("noobmasters_newsfeed_" + follower.UserId);
                    if (resJson != null)
                    {
                        PaginatedTweetResponseDto? newsfeed = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(resJson);
                        if (newsfeed != null && newsfeed.Tweets != null)
                        {
                            newsfeed.Tweets = newsfeed.Tweets.Select(t => t.Id == cacheNotificationConsumerDto.Tweet.Id ? cacheNotificationConsumerDto.Tweet : t).ToList();

                            await _database.StringSetAsync("noobmasters_newsfeed_" + follower.UserId, JsonConvert.SerializeObject(newsfeed), TimeSpan.FromMinutes(cacheTime));
                        }
                    }
                }
                // Updating Timeline of user
                string? timelineJson = await _database.StringGetAsync("noobmasters_timeline_" + cacheNotificationConsumerDto.Tweet.UserId);
                if (timelineJson != null)
                {
                    PaginatedTweetResponseDto? timeline = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(timelineJson);
                    if (timeline != null && timeline.Tweets != null)
                    {
                        timeline.Tweets = timeline.Tweets.Select(t => t.Id == cacheNotificationConsumerDto.Tweet.Id ? cacheNotificationConsumerDto.Tweet : t).ToList();
                        await _database.StringSetAsync("noobmasters_timeline_" + cacheNotificationConsumerDto.Tweet.UserId, JsonConvert.SerializeObject(timeline), TimeSpan.FromMinutes(cacheTime));
                    }
                }
            }
        }
        private async void DeleteTweet(CacheNotificationConsumerDto cacheNotificationConsumerDto)
        {
            if (cacheNotificationConsumerDto.Tweet != null)
            {
                // Updating NewsFeed of followers
                var followers = await _followCollection.Find(f => f.FollowingId == cacheNotificationConsumerDto.Tweet.UserId).ToListAsync();
                foreach (var follower in followers)
                {
                    string? resJson = await _database.StringGetAsync("noobmasters_newsfeed_" + follower.UserId);
                    if (resJson != null)
                    {
                        PaginatedTweetResponseDto? newsfeed = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(resJson);
                        if (newsfeed != null && newsfeed.Tweets != null)
                        {
                            long countBefore = newsfeed.Tweets.Count;

                            newsfeed.Tweets = newsfeed.Tweets.Where(t => t.Id != cacheNotificationConsumerDto.Tweet.Id).ToList();
                            long countAfter = newsfeed.Tweets.Count;
                            if (countBefore != countAfter)
                            {
                                newsfeed.TotalElements -= 1;
                                newsfeed.LastPage = (int)Math.Ceiling((double)newsfeed.TotalElements / newsfeed.Size) - 1;
                                newsfeed.LastPage = newsfeed.LastPage < 0 ? 0 : newsfeed.LastPage;
                                newsfeed.TotalPages = (int)Math.Ceiling((double)newsfeed.TotalElements / newsfeed.Size);
                            }
                            await _database.StringSetAsync("noobmasters_newsfeed_" + follower.UserId, JsonConvert.SerializeObject(newsfeed), TimeSpan.FromMinutes(cacheTime));
                        }
                    }
                }
                // Updating Timeline of user
                string? timelineJson = await _database.StringGetAsync("noobmasters_timeline_" + cacheNotificationConsumerDto.Tweet.UserId);
                if (timelineJson != null)
                {
                    PaginatedTweetResponseDto? timeline = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(timelineJson);
                    if (timeline != null && timeline.Tweets != null)
                    {
                        long countBefore = timeline.Tweets.Count;

                        timeline.Tweets = timeline.Tweets.Where(t => t.Id != cacheNotificationConsumerDto.Tweet.Id).ToList();
                        long countAfter = timeline.Tweets.Count;
                        if (countBefore != countAfter)
                        {
                            timeline.TotalElements -= 1;
                            timeline.LastPage = (int)Math.Ceiling((double)timeline.TotalElements / timeline.Size) - 1;
                            timeline.LastPage = timeline.LastPage < 0 ? 0 : timeline.LastPage;
                            timeline.TotalPages = (int)Math.Ceiling((double)timeline.TotalElements / timeline.Size);
                        }
                        await _database.StringSetAsync("noobmasters_timeline_" + cacheNotificationConsumerDto.Tweet.UserId, JsonConvert.SerializeObject(timeline), TimeSpan.FromMinutes(cacheTime));
                    }
                }
            }
        }

        private async void LikeCommentTweet(CacheNotificationConsumerDto cacheNotificationConsumerDto)
        {
            if (cacheNotificationConsumerDto.Tweet != null)
            {
                // Getting tweet owner info and ref tweet and ref user in case of Re tweet
                cacheNotificationConsumerDto.Tweet.User = (await _usersCollection.Find(u => u.Id == cacheNotificationConsumerDto.Tweet.UserId && u.DeletedAt == null && u.BlockedAt == null).FirstOrDefaultAsync()).AsDtoTweetComment();
                if (cacheNotificationConsumerDto.Tweet.User == null)
                    return;
                if (cacheNotificationConsumerDto.Tweet.Type == "Retweet")
                {
                    Tweets refTweet = await _tweetCollection.Find(t => t.Id == cacheNotificationConsumerDto.Tweet.RetweetRefId).FirstOrDefaultAsync();
                    if (refTweet != null)
                    {
                        User refUser = await _usersCollection.Find(u => u.Id == refTweet.UserId && u.DeletedAt == null && u.BlockedAt == null).FirstOrDefaultAsync();
                        if (refUser != null)
                        {
                            cacheNotificationConsumerDto.Tweet.RefTweet = refTweet.AsDto();
                            cacheNotificationConsumerDto.Tweet.RefTweet.User = refUser.AsDtoTweetComment();
                        }
                    }
                }

                // Updating NewsFeed of followers
                var followers = await _followCollection.Find(f => f.FollowingId == cacheNotificationConsumerDto.Tweet.UserId).ToListAsync();
                foreach (var follower in followers)
                {
                    string? resJson = await _database.StringGetAsync("noobmasters_newsfeed_" + follower.UserId);
                    if (resJson != null)
                    {
                        PaginatedTweetResponseDto? newsfeed = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(resJson);
                        if (newsfeed != null && newsfeed.Tweets != null)
                        {
                            newsfeed.Tweets = newsfeed.Tweets.Select(t => t.Id == cacheNotificationConsumerDto.Tweet.Id ? cacheNotificationConsumerDto.Tweet : t).ToList();

                            await _database.StringSetAsync("noobmasters_newsfeed_" + follower.UserId, JsonConvert.SerializeObject(newsfeed), TimeSpan.FromMinutes(cacheTime));
                        }
                    }
                }

                // Updating Timeline of user
                string? timelineJson = await _database.StringGetAsync("noobmasters_timeline_" + cacheNotificationConsumerDto.Tweet.UserId);
                if (timelineJson != null)
                {
                    PaginatedTweetResponseDto? timeline = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(timelineJson);
                    if (timeline != null && timeline.Tweets != null)
                    {
                        timeline.Tweets = timeline.Tweets.Select(t => t.Id == cacheNotificationConsumerDto.Tweet.Id ? cacheNotificationConsumerDto.Tweet : t).ToList();
                        await _database.StringSetAsync("noobmasters_timeline_" + cacheNotificationConsumerDto.Tweet.UserId, JsonConvert.SerializeObject(timeline), TimeSpan.FromMinutes(cacheTime));
                    }
                }
            }
        }

        private async void BlockByAdmin(CacheNotificationConsumerDto cacheNotificationConsumerDto)
        {
            // count needs to be updated
            if (cacheNotificationConsumerDto.UserId != null)
            {
                String userId = cacheNotificationConsumerDto.UserId;
                // Updating NewsFeed of followers
                var followers = await _followCollection.Find(f => f.FollowingId == userId).ToListAsync();
                foreach (var follower in followers)
                {
                    string? resJson = await _database.StringGetAsync("noobmasters_newsfeed_" + follower.UserId);
                    if (resJson != null)
                    {
                        PaginatedTweetResponseDto? newsfeed = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(resJson);
                        if (newsfeed != null && newsfeed.Tweets != null)
                        {
                            newsfeed.Tweets = newsfeed.Tweets.Where(t => t.UserId != userId).ToList();
                            foreach (var tweet in newsfeed.Tweets)
                            {
                                if (tweet.Type == "Retweet" && tweet.RefTweet != null && tweet.RefTweet.UserId == userId)
                                {
                                    tweet.RefTweet = null;
                                }
                            }
                            await _database.StringSetAsync("noobmasters_newsfeed_" + follower.UserId, JsonConvert.SerializeObject(newsfeed), TimeSpan.FromMinutes(cacheTime));
                        }
                    }
                }
            }
        }
        private async void BlockByUser(CacheNotificationConsumerDto cacheNotificationConsumerDto)
        {
            // count needs to be updated
            if (cacheNotificationConsumerDto.UserId != null && cacheNotificationConsumerDto.RefUserId != null)
            {
                String userId = cacheNotificationConsumerDto.UserId;
                // Updating NewsFeed of blocked user
                string? resJson = await _database.StringGetAsync("noobmasters_newsfeed_" + userId);
                if (resJson != null)
                {
                    PaginatedTweetResponseDto? newsfeed = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(resJson);
                    if (newsfeed != null && newsfeed.Tweets != null)
                    {
                        newsfeed.Tweets = newsfeed.Tweets.Where(t => t.UserId != cacheNotificationConsumerDto.RefUserId).ToList();
                        foreach (var tweet in newsfeed.Tweets)
                        {
                            if (tweet.Type == "Retweet" && tweet.RefTweet != null && tweet.RefTweet.UserId == cacheNotificationConsumerDto.RefUserId)
                            {
                                tweet.RefTweet = null;
                            }
                        }
                        await _database.StringSetAsync("noobmasters_newsfeed_" + userId, JsonConvert.SerializeObject(newsfeed), TimeSpan.FromMinutes(cacheTime));
                    }
                }
                // Updating Timeline of blocking user
                String refUserId = cacheNotificationConsumerDto.UserId;
                string? timelineJson = await _database.StringGetAsync("noobmasters_timeline_" + refUserId);
                if (timelineJson != null)
                {
                    PaginatedTweetResponseDto? timeline = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(timelineJson);
                    if (timeline != null && timeline.Tweets != null)
                    {
                        timeline.Tweets = timeline.Tweets.Where(t => t.UserId != cacheNotificationConsumerDto.UserId).ToList();
                        foreach (var tweet in timeline.Tweets)
                        {
                            if (tweet.Type == "Retweet" && tweet.RefTweet != null && tweet.RefTweet.UserId == cacheNotificationConsumerDto.UserId)
                            {
                                tweet.RefTweet = null;
                            }
                        }
                        await _database.StringSetAsync("noobmasters_timeline_" + refUserId, JsonConvert.SerializeObject(timeline), TimeSpan.FromMinutes(cacheTime));
                    }
                }
                // Updating NewsFeed of blocking user
                string? refResJson = await _database.StringGetAsync("noobmasters_newsfeed_" + refUserId);
                if (refResJson != null)
                {
                    PaginatedTweetResponseDto? newsfeed = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(refResJson);
                    if (newsfeed != null && newsfeed.Tweets != null)
                    {
                        newsfeed.Tweets = newsfeed.Tweets.Where(t => t.UserId != cacheNotificationConsumerDto.UserId).ToList();
                        foreach (var tweet in newsfeed.Tweets)
                        {
                            if (tweet.Type == "Retweet" && tweet.RefTweet != null && tweet.RefTweet.UserId == cacheNotificationConsumerDto.UserId)
                            {
                                tweet.RefTweet = null;
                            }
                        }
                        await _database.StringSetAsync("noobmasters_newsfeed_" + refUserId, JsonConvert.SerializeObject(newsfeed), TimeSpan.FromMinutes(cacheTime));
                    }
                }
                // Updating Timeline of blocked user
                string? refTimelineJson = await _database.StringGetAsync("noobmasters_timeline_" + userId);
                if (refTimelineJson != null)
                {
                    PaginatedTweetResponseDto? timeline = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(refTimelineJson);
                    if (timeline != null && timeline.Tweets != null)
                    {
                        timeline.Tweets = timeline.Tweets.Where(t => t.UserId != cacheNotificationConsumerDto.RefUserId).ToList();
                        foreach (var tweet in timeline.Tweets)
                        {
                            if (tweet.Type == "Retweet" && tweet.RefTweet != null && tweet.RefTweet.UserId == cacheNotificationConsumerDto.RefUserId)
                            {
                                tweet.RefTweet = null;
                            }
                        }
                        await _database.StringSetAsync("noobmasters_timeline_" + userId, JsonConvert.SerializeObject(timeline), TimeSpan.FromMinutes(cacheTime));
                    }
                }

            }
        }
        private async void Unfollow(CacheNotificationConsumerDto cacheNotificationConsumerDto)
        {
            if (cacheNotificationConsumerDto.UserId != null && cacheNotificationConsumerDto.RefUserId != null)
            {
                // Updating NewsFeed of unfollowing user
                string? resJson = await _database.StringGetAsync("noobmasters_newsfeed_" + cacheNotificationConsumerDto.RefUserId);
                if (resJson != null)
                {
                    PaginatedTweetResponseDto? newsfeed = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(resJson);
                    if (newsfeed != null && newsfeed.Tweets != null)
                    {
                        long countBefore = newsfeed.Tweets.Count;
                        newsfeed.Tweets = newsfeed.Tweets.Where(t => t.UserId != cacheNotificationConsumerDto.UserId).ToList();
                        long countAfter = newsfeed.Tweets.Count;
                        if (countBefore != countAfter)
                        {
                            newsfeed.TotalElements -= (countBefore - countAfter);
                            newsfeed.LastPage = (int)Math.Ceiling((double)newsfeed.TotalElements / newsfeed.Size) - 1;
                            newsfeed.LastPage = newsfeed.LastPage < 0 ? 0 : newsfeed.LastPage;
                            newsfeed.TotalPages = (int)Math.Ceiling((double)newsfeed.TotalElements / newsfeed.Size);
                        }
                        await _database.StringSetAsync("noobmasters_newsfeed_" + cacheNotificationConsumerDto.RefUserId, JsonConvert.SerializeObject(newsfeed), TimeSpan.FromMinutes(cacheTime));
                    }
                }
            }
        }


    }
}



