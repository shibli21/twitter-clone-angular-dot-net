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
        
        public async Task<string> FollowByUserId( string followingId)
        {
            string msg = "Something went wrong";
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
                        msg = "Followed";
                    }
                    else
                    {
                        await _followCollection.DeleteOneAsync(f => f.UserId == userId && f.FollowingId == followingId);
                        msg = "Unfollowed";
                    }
                }
            }
            return msg;
            

        }

        public async Task<PaginatedUserResponseDto> GetFollowers( int limit, int page)
        {
            if (_httpContextAccessor.HttpContext != null){
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var filter =  _followCollection.Find(f => f.FollowingId == userId);
                int LastPage = (int)Math.Ceiling((double)await filter.CountDocumentsAsync() / limit) - 1;
                LastPage = LastPage < 0 ? 0 : LastPage;
                string[] followersIds = (await filter.Skip((page ) * limit).Limit(limit).ToListAsync()).Select(f => f.UserId).ToArray();
                var users = await _user.Find(u => followersIds.Contains(u.Id)).ToListAsync();
                return new PaginatedUserResponseDto
                {
                    TotalElements = await filter.CountDocumentsAsync(),
                    Users = users.Select(u => u.AsDto()).ToList(),
                    Page = page,
                    LastPage = LastPage,
                    Size = limit,
                    TotalPages = (int)Math.Ceiling((double)await filter.CountDocumentsAsync() / limit)
                };
                

                
            }
            return new PaginatedUserResponseDto();
        }

        public async Task<PaginatedUserResponseDto> GetFollowing(int limit , int page)
        {
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var filter = _followCollection.Find(f => f.UserId == userId);
                int LastPage = (int)Math.Ceiling((double)await filter.CountDocumentsAsync() / limit) - 1;
                LastPage = LastPage < 0 ? 0 : LastPage;
                string[] followingIds = (await filter.Skip((page) * limit).Limit(limit).ToListAsync()).Select(f => f.FollowingId).ToArray();
                var users = await _user.Find(u => followingIds.Contains(u.Id)).ToListAsync();
                return new PaginatedUserResponseDto
                {
                    TotalElements = await filter.CountDocumentsAsync(),
                    Users = users.Select(u => u.AsDto()).ToList(),
                    Page = page,
                    LastPage = LastPage,
                    Size = limit,
                    TotalPages = (int)Math.Ceiling((double)await filter.CountDocumentsAsync() / limit)
                };
            }
            return new PaginatedUserResponseDto();
        }

    }
}