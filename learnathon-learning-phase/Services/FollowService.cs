using System.Security.Claims;
using learnathon_learning_phase.Dtos;
using learnathon_learning_phase.Models;
using Microsoft.Extensions.Options;
using learnathon_learning_phase.Extentions;
using MongoDB.Driver;
using learnathon_learning_phase.Interfaces;

namespace learnathon_learning_phase.Services
{
    public class FollowService : IFollowerService
    {
        private readonly IMongoCollection<FollowModel> _followCollection;
        private readonly IMongoCollection<UserModel> _user;

        private readonly IHttpContextAccessor _httpContextAccessor;
        public FollowService(IOptions<NoobMastersDatabaseSettings> noobCloneDatabaseSettings, IMongoClient mongoClient,  IHttpContextAccessor httpContextAccessor)
        {
            
            var mongoDatabase = mongoClient.GetDatabase(noobCloneDatabaseSettings.Value.DatabaseName);

            _followCollection = mongoDatabase.GetCollection<FollowModel>(noobCloneDatabaseSettings.Value.FollowerCollectionName);

            _user = mongoDatabase.GetCollection<UserModel>(noobCloneDatabaseSettings.Value.UserCollectionName);

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

        public async Task<List<UserResponseDto>> GetFollowers( int limit, int page)
        {
            if (_httpContextAccessor.HttpContext != null){
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                string[] followersIds = (await _followCollection.Find(f => f.FollowingId == userId).Skip((page ) * limit).Limit(limit).ToListAsync()).Select(f => f.UserId).ToArray();
                return (await _user.Find(u => followersIds.Contains(u.Id)).ToListAsync()).Select(u => u.AsDto()).ToList();

                
            }
            return new List<UserResponseDto>();
        }

        public async Task<List<UserResponseDto>> GetFollowing(int limit , int page)
        {
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                string[] followingIds = (await _followCollection.Find(f => f.UserId == userId).Skip((page) * limit).Limit(limit).ToListAsync()).Select(f => f.FollowingId).ToArray();
                return (await _user.Find(u => followingIds.Contains(u.Id)).ToListAsync()).Select(u => u.AsDto()).ToList();
            }
            return new List<UserResponseDto>();
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