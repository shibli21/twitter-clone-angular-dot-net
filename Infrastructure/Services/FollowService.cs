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
    public class FollowService : IFollowerService
    {
        private readonly IMongoCollection<Follows> _followCollection;
        private readonly IMongoCollection<User> _user;

        private readonly IHttpContextAccessor _httpContextAccessor;
        public FollowService(IOptions<TwitterCloneDbConfig> twitterCloneDbConfig, IMongoClient mongoClient,  IHttpContextAccessor httpContextAccessor)
        {
            
            var mongoDatabase = mongoClient.GetDatabase(twitterCloneDbConfig.Value.DatabaseName);

            _followCollection = mongoDatabase.GetCollection<Follows>(twitterCloneDbConfig.Value.FollowerCollectionName);

            _user = mongoDatabase.GetCollection<User>(twitterCloneDbConfig.Value.UserCollectionName);

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
                        follow = new Follows
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