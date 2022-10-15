using System.Security.Claims;
using learnathon_learning_phase.Dtos;
using learnathon_learning_phase.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace learnathon_learning_phase.Services
{
    public class FollowService : IFollowerService
    {
        private readonly IMongoCollection<FollowModel> _followCollection;

        private readonly IHttpContextAccessor _httpContextAccessor;
        public FollowService(IOptions<NoobMastersDatabaseSettings> noobCloneDatabaseSettings, IMongoClient mongoClient,  IHttpContextAccessor httpContextAccessor)
        {
            
            var mongoDatabase = mongoClient.GetDatabase(noobCloneDatabaseSettings.Value.DatabaseName);

            _followCollection = mongoDatabase.GetCollection<FollowModel>(noobCloneDatabaseSettings.Value.FollowerCollectionName);

            _httpContextAccessor = httpContextAccessor;
        }
        
        public async Task FollowByUserId( string followingId)
        {
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if(userId != null)
                {
                    var follow = await _followCollection.Find(f => f.UserId == userId && f.FollowingId == followingId).FirstOrDefaultAsync();
                    if (follow == null)
                    {
                        follow = new FollowModel
                        {
                            UserId = userId,
                            FollowingId = followingId,

                        };
                        await _followCollection.InsertOneAsync(follow);
                    }
                }
            }
            

        }

        public Task<List<FollowModel>> GetFollowers()
        {
            throw new NotImplementedException();
        }

        public Task<List<FollowModel>> GetFollowing()
        {
            throw new NotImplementedException();
        }

        public async Task UnFollowByUserId(string followingId)
        {


            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if(userId != null)
                {
                    var follow = await _followCollection.Find(f => f.UserId == userId && f.FollowingId == followingId).FirstOrDefaultAsync();
                    if (follow != null)
                    {
                        await _followCollection.DeleteOneAsync(f => f.Id == follow.Id);
                    }
                    
                }
            }
        }
    }
}