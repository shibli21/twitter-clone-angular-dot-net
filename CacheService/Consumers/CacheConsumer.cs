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
        private readonly IMongoCollection<LikeRetweets> _likeRetweetCollection;
        private readonly IConnectionMultiplexer _connectionMultiplexer;
        private readonly IDatabase _database;
        private int cacheTime = 60;
        public CacheConsumer(IOptions<TwitterCloneDbConfig> twitterCloneDbConfig, IMongoClient mongoClient, IConnectionMultiplexer connectionMultiplexer)
        {
            var mongoDatabase = mongoClient.GetDatabase(twitterCloneDbConfig.Value.DatabaseName);
            _usersCollection = mongoDatabase.GetCollection<User>(twitterCloneDbConfig.Value.UserCollectionName);
            _followCollection = mongoDatabase.GetCollection<Follows>(twitterCloneDbConfig.Value.FollowerCollectionName);
            _tweetCollection = mongoDatabase.GetCollection<Tweets>(twitterCloneDbConfig.Value.TweetCollectionName);
            _likeRetweetCollection = mongoDatabase.GetCollection<LikeRetweets>(twitterCloneDbConfig.Value.LikeRetweetCollectionName);
            _connectionMultiplexer = connectionMultiplexer;
            _database = _connectionMultiplexer.GetDatabase();

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
            else if (cacheNotificationConsumerDto.Type == "Comment" || cacheNotificationConsumerDto.Type == "Delete Comment")
                CommentTweet(cacheNotificationConsumerDto);
            else if (cacheNotificationConsumerDto.Type == "Like" || cacheNotificationConsumerDto.Type == "Unlike")
                LikeTweet(cacheNotificationConsumerDto);
            else if (cacheNotificationConsumerDto.Type == "Block by user")
                BlockByUser(cacheNotificationConsumerDto);
            else if (cacheNotificationConsumerDto.Type == "Block by admin")
                BlockByAdmin(cacheNotificationConsumerDto);
            else if (cacheNotificationConsumerDto.Type == "Unfollow")
                Unfollow(cacheNotificationConsumerDto);
            else if (cacheNotificationConsumerDto.Type == "Follow")
                Follow(cacheNotificationConsumerDto);
            else if (cacheNotificationConsumerDto.Type == "Edit Profile")
                EditProfile(cacheNotificationConsumerDto);

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
                            newsfeed.TotalPages = newsfeed.LastPage + 1;
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
                        timeline.TotalPages = timeline.LastPage + 1;
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
                        Type = "UpdateRetweet",
                        RefUserId = cacheNotificationConsumerDto.Tweet.UserId
                    };
                    UpdateRetweetRef(cacheNotificationConsumerDtoRefTweet);
                }
            }
        }



        private async void UpdateRetweetRef(CacheNotificationConsumerDto cacheNotificationConsumerDto)
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
                            foreach (var tweet in newsfeed.Tweets)
                            {
                                if (tweet.Id == cacheNotificationConsumerDto.Tweet.Id)
                                {
                                    if (follower.UserId == cacheNotificationConsumerDto.RefUserId)
                                    {
                                        tweet.IsRetweeted = true;
                                    }
                                    tweet.RetweetCount = cacheNotificationConsumerDto.Tweet.RetweetCount;
                                    break;
                                }
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
                        foreach (var tweet in timeline.Tweets)
                        {
                            if (tweet.Id == cacheNotificationConsumerDto.Tweet.Id)
                            {
                                if (tweet.UserId == cacheNotificationConsumerDto.RefUserId)
                                {
                                    tweet.IsRetweeted = true;
                                }
                                tweet.RetweetCount = cacheNotificationConsumerDto.Tweet.RetweetCount;
                                break;
                            }
                        }
                        await _database.StringSetAsync("noobmasters_timeline_" + cacheNotificationConsumerDto.Tweet.UserId, JsonConvert.SerializeObject(timeline), TimeSpan.FromMinutes(cacheTime));
                    }
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
                            foreach (var tweet in newsfeed.Tweets)
                            {
                                if (tweet.Id == cacheNotificationConsumerDto.Tweet.Id)
                                {
                                    tweet.Tweet = cacheNotificationConsumerDto.Tweet.Tweet;
                                    tweet.History = cacheNotificationConsumerDto.Tweet.History;
                                    break;
                                }
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
                        foreach (var tweet in timeline.Tweets)
                        {
                            if (tweet.Id == cacheNotificationConsumerDto.Tweet.Id)
                            {
                                tweet.Tweet = cacheNotificationConsumerDto.Tweet.Tweet;
                                tweet.History = cacheNotificationConsumerDto.Tweet.History;
                                break;
                            }
                        }
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

        private async void LikeTweet(CacheNotificationConsumerDto cacheNotificationConsumerDto)
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
                            foreach (var tweet in newsfeed.Tweets)
                            {
                                if (tweet.Id == cacheNotificationConsumerDto.Tweet.Id)
                                {
                                    tweet.LikeCount = cacheNotificationConsumerDto.Tweet.LikeCount;
                                    if (follower.UserId == cacheNotificationConsumerDto.RefUserId)
                                    {
                                        tweet.IsLiked = cacheNotificationConsumerDto.Tweet.IsLiked;
                                    }
                                    break;
                                }
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
                        foreach (var tweet in timeline.Tweets)
                        {
                            if (tweet.Id == cacheNotificationConsumerDto.Tweet.Id)
                            {
                                tweet.LikeCount = cacheNotificationConsumerDto.Tweet.LikeCount;
                                if (tweet.UserId == cacheNotificationConsumerDto.RefUserId)
                                {
                                    tweet.IsLiked = cacheNotificationConsumerDto.Tweet.IsLiked;
                                }
                                break;
                            }
                        }
                        await _database.StringSetAsync("noobmasters_timeline_" + cacheNotificationConsumerDto.Tweet.UserId, JsonConvert.SerializeObject(timeline), TimeSpan.FromMinutes(cacheTime));
                    }
                }
            }
        }
        private async void CommentTweet(CacheNotificationConsumerDto cacheNotificationConsumerDto)
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
                            foreach (var tweet in newsfeed.Tweets)
                            {
                                if (tweet.Id == cacheNotificationConsumerDto.Tweet.Id)
                                {
                                    tweet.CommentCount = cacheNotificationConsumerDto.Tweet.CommentCount;

                                    break;
                                }
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
                        foreach (var tweet in timeline.Tweets)
                        {
                            if (tweet.Id == cacheNotificationConsumerDto.Tweet.Id)
                            {
                                tweet.CommentCount = cacheNotificationConsumerDto.Tweet.CommentCount;

                                break;
                            }
                        }
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
                            
                            await _database.StringSetAsync("noobmasters_newsfeed_" + follower.UserId, JsonConvert.SerializeObject(newsfeed), TimeSpan.FromMinutes(cacheTime));
                        }
                    }
                }
                // Updating Timeline of users who retweeted the blocked users tweet
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
                        await _database.StringSetAsync("noobmasters_newsfeed_" + userId, JsonConvert.SerializeObject(newsfeed), TimeSpan.FromMinutes(cacheTime));
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
                        
                        await _database.StringSetAsync("noobmasters_timeline_" + userId, JsonConvert.SerializeObject(timeline), TimeSpan.FromMinutes(cacheTime));
                    }
                }
                // Updating Timeline of blocking user
                String refUserId = cacheNotificationConsumerDto.RefUserId;
                string? timelineJson = await _database.StringGetAsync("noobmasters_timeline_" + refUserId);
                if (timelineJson != null)
                {
                    PaginatedTweetResponseDto? timeline = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(timelineJson);
                    if (timeline != null && timeline.Tweets != null)
                    {
                        timeline.Tweets = timeline.Tweets.Where(t => t.UserId != cacheNotificationConsumerDto.UserId).ToList();
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
                        await _database.StringSetAsync("noobmasters_newsfeed_" + refUserId, JsonConvert.SerializeObject(newsfeed), TimeSpan.FromMinutes(cacheTime));
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

        private async void Follow(CacheNotificationConsumerDto cacheNotificationConsumerDto)
        {
            if (cacheNotificationConsumerDto.UserId != null && cacheNotificationConsumerDto.RefUserId != null)
            {
                // Updating NewsFeed of following user
                string? resJson = await _database.StringGetAsync("noobmasters_newsfeed_" + cacheNotificationConsumerDto.RefUserId);
                if (resJson != null)
                {
                    PaginatedTweetResponseDto? newsfeed = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(resJson);
                    if (newsfeed != null)
                    {
                        TweetCommentUserResponseDto? user = (await _usersCollection.Find(u => u.Id == cacheNotificationConsumerDto.RefUserId).FirstOrDefaultAsync())?.AsDtoTweetComment();
                        if (user != null)
                        {
                            newsfeed = await GetNewsFeed(cacheNotificationConsumerDto.RefUserId, newsfeed.Size, newsfeed.Page);
                            if (newsfeed.Tweets != null)
                            {
                                foreach (TweetResponseDto tweet in newsfeed.Tweets)
                                {
                                    tweet.User = (await _usersCollection.Find(u => u.Id == tweet.UserId).FirstOrDefaultAsync())?.AsDtoTweetComment();
                                    LikedOrRetweetedDto likedOrRetweet = await IsLikedOrRetweeted(cacheNotificationConsumerDto.RefUserId, tweet.Id);
                                    tweet.IsLiked = likedOrRetweet.IsLiked;
                                    tweet.IsRetweeted = likedOrRetweet.IsRetweeted;
                                }
                            }
                            await _database.StringSetAsync("noobmasters_newsfeed_" + cacheNotificationConsumerDto.RefUserId, JsonConvert.SerializeObject(newsfeed), TimeSpan.FromMinutes(cacheTime));
                        }

                    }
                }
            }
        }



        private async void EditProfile(CacheNotificationConsumerDto cacheNotificationConsumerDto)
        {
            if (cacheNotificationConsumerDto.RefUserId != null)
            {

                User? user = await _usersCollection.Find(u => u.Id == cacheNotificationConsumerDto.RefUserId).FirstOrDefaultAsync();
                if (user != null)
                {
                    // / updating timeline of user
                    string? timelineJson = await _database.StringGetAsync("noobmasters_timeline_" + cacheNotificationConsumerDto.RefUserId);
                    if (timelineJson != null)
                    {
                        PaginatedTweetResponseDto? timeline = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(timelineJson);
                        if (timeline != null && timeline.Tweets != null)
                        {
                            foreach (var tweet in timeline.Tweets)
                            {
                                tweet.User = user.AsDtoTweetComment();
                            }
                            await _database.StringSetAsync("noobmasters_timeline_" + cacheNotificationConsumerDto.RefUserId, JsonConvert.SerializeObject(timeline), TimeSpan.FromMinutes(cacheTime));
                        }
                    }
                    // updating newsfeed of followers
                    var followers = await _followCollection.Find(f => f.FollowingId == user.Id).ToListAsync();
                    if (followers != null)
                    {
                        foreach (var follower in followers)
                        {
                            string? newsfeedJson = await _database.StringGetAsync("noobmasters_newsfeed_" + follower.UserId);
                            if (newsfeedJson != null)
                            {
                                PaginatedTweetResponseDto? newsfeed = JsonConvert.DeserializeObject<PaginatedTweetResponseDto>(newsfeedJson);
                                if (newsfeed != null && newsfeed.Tweets != null)
                                {
                                    foreach (var tweet in newsfeed.Tweets)
                                    {
                                        if (tweet.UserId == user.Id)
                                        {
                                            tweet.User = user.AsDtoTweetComment();
                                        }
                                    }
                                    await _database.StringSetAsync("noobmasters_newsfeed_" + follower.UserId, JsonConvert.SerializeObject(newsfeed), TimeSpan.FromMinutes(cacheTime));
                                }
                            }
                        }
                    }
                }
            }
        }




        private async Task<LikedOrRetweetedDto> IsLikedOrRetweeted(string userId, string tweetId)
        {
            LikedOrRetweetedDto likeRetweetResponse = new LikedOrRetweetedDto();

            LikeRetweets? likeRetweet = await _likeRetweetCollection.Find(x => x.UserId == userId && x.TweetId == tweetId).FirstOrDefaultAsync();
            if (likeRetweet != null)
            {
                likeRetweetResponse = new LikedOrRetweetedDto
                {
                    IsLiked = likeRetweet.IsLiked,
                    IsRetweeted = likeRetweet.IsRetweeted
                };
            }
            return likeRetweetResponse;
        }

        public async Task<PaginatedTweetResponseDto> GetNewsFeed(string userId, int size, int page)
        {
            string[] followingIds = (await _followCollection.Find(f => f.UserId == userId).ToListAsync()).Select(f => f.FollowingId).ToArray();
            string[] adminBlockIds = (await _usersCollection.Find(u => u.BlockedAt != null).ToListAsync()).Select(u => u.Id).ToArray();
            followingIds = followingIds.Except(adminBlockIds).ToArray();
            var filter = _tweetCollection.Find(t => followingIds.Contains(t.UserId) && t.DeletedAt == null).SortByDescending(t => t.CreatedAt);
            long totalElements = await filter.CountDocumentsAsync();
            int LastPage = (int)Math.Ceiling((double)totalElements / size) - 1;
            LastPage = LastPage < 0 ? 0 : LastPage;
            return new PaginatedTweetResponseDto()
            {
                TotalElements = totalElements,
                Page = page,
                Size = size,
                LastPage = LastPage,
                TotalPages = LastPage + 1,
                Tweets = await filter.Skip((page) * size)
                                    .Limit(size)
                                    .Project(tweet => tweet.AsDto())
                                    .ToListAsync()
            };

        }


    }
}



