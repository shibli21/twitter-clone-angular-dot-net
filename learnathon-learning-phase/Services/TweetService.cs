using System.Security.Claims;
using learnathon_learning_phase.Dtos;
using learnathon_learning_phase.Dtos.Tweet;
using learnathon_learning_phase.Interfaces;
using learnathon_learning_phase.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace learnathon_learning_phase.Services
{
    public class TweetService : ITweetService
    {

        private readonly IMongoCollection<TweetModel> _tweetCollection;
        private readonly IMongoCollection<HashTagModel> _hashTagCollection;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public TweetService(IOptions<NoobMastersDatabaseSettings> noobCloneDatabaseSettings, IMongoClient mongoClient,  IHttpContextAccessor httpContextAccessor)
        {
            var mongoDatabase = mongoClient.GetDatabase(noobCloneDatabaseSettings.Value.DatabaseName);

            _tweetCollection = mongoDatabase.GetCollection<TweetModel>(noobCloneDatabaseSettings.Value.TweetCollectionName);
            _hashTagCollection = mongoDatabase.GetCollection<HashTagModel>(noobCloneDatabaseSettings.Value.HashTagCollectionName);
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task CreateTweet(TweetRequestDto tweet)
        {
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if(userId != null)
                {
                    var tweetModel = new TweetModel
                    {
                        UserId = userId,
                        Tweet = tweet.Tweet,
                    };
                    await _tweetCollection.InsertOneAsync(tweetModel);

                    foreach (var hashTag in tweet.HashTags)
                    {
                        var hashTagModel = new HashTagModel
                        {
                            HashTag = hashTag,
                            TweetId = tweetModel.Id,
                        };
                        await _hashTagCollection.InsertOneAsync(hashTagModel);
                    }

                }



            }
        }

        public async Task<TweetModel?> GetTweetById(string id)
        {
            TweetModel? tweet = null;
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if(userId != null)
                {
                    tweet = await _tweetCollection.Find(tweet => tweet.Id == id).FirstOrDefaultAsync();
                }
            }
            return tweet;

        }

        public async Task<TweetModel> UpdateTweet(TweetModel tweet,TweetRequestDto tweetRequest)
        {
            if(tweet.History.Length == 0)
            {
                tweet.History = new string[1];
                tweet.History[0] = tweet.Tweet;
            }
            else
            {
                tweet.History = tweet.History.Append(tweet.Tweet).ToArray();
            }
            tweet.Tweet = tweetRequest.Tweet;
            tweet.UpdatedAt =  DateTime.Now;
            await _tweetCollection.ReplaceOneAsync(t => t.Id == tweet.Id, tweet);
            await _hashTagCollection.DeleteManyAsync(hashTag => hashTag.TweetId == tweet.Id);
            foreach (var hashTag in tweetRequest.HashTags)
            {
                var hashTagModel = new HashTagModel
                {
                    HashTag = hashTag,
                    TweetId = tweet.Id,
                };
                await _hashTagCollection.InsertOneAsync(hashTagModel);
            }
            return tweet;
        }

        public async Task DeleteTweet(string id)
        {
            await _tweetCollection.DeleteOneAsync(tweet => tweet.Id == id);
            await _hashTagCollection.DeleteManyAsync(hashTag => hashTag.TweetId == id);
        }
    }

    
}