
using System.Security.Claims;
using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Config;
using MassTransit;
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
        public FollowService(IOptions<TwitterCloneDbConfig> twitterCloneDbConfig, IMongoClient mongoClient, IHttpContextAccessor httpContextAccessor)
        {

            var mongoDatabase = mongoClient.GetDatabase(twitterCloneDbConfig.Value.DatabaseName);

            _followCollection = mongoDatabase.GetCollection<Follows>(twitterCloneDbConfig.Value.FollowerCollectionName);

            _user = mongoDatabase.GetCollection<User>(twitterCloneDbConfig.Value.UserCollectionName);

            _httpContextAccessor = httpContextAccessor;

        }

        public async Task<string> FollowByUserId(string userId, string followingId)
        {
            string msg = "Something went wrong";

            var follow = await _followCollection.Find(f => f.UserId == userId && f.FollowingId == followingId).FirstOrDefaultAsync();
            var followingUser = await _user.Find(u => u.Id == followingId && u.DeletedAt == null && u.BlockedAt == null).FirstOrDefaultAsync();
            if (followingUser == null)
            {
                return msg;
            }
            if (follow == null)
            {
                follow = new Follows
                {
                    UserId = userId,
                    FollowingId = followingId
                };
                await _followCollection.InsertOneAsync(follow);
                msg = "Followed";
            }
            else
            {
                await _followCollection.DeleteOneAsync(f => f.UserId == userId && f.FollowingId == followingId);
                msg = "Unfollowed";
            }

            return msg;


        }

        public async Task<PaginatedFollowerResponseDto> GetFollowers(string userId, int limit, int page)
        {
            var authUserId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var filter = _followCollection.Find(f => f.FollowingId == userId);
            long totalElements = await filter.CountDocumentsAsync();
            int LastPage = (int)Math.Ceiling((double)totalElements / limit) - 1;
            LastPage = LastPage < 0 ? 0 : LastPage;
            string[] followersIds = (await filter.Skip((page) * limit).Limit(limit).ToListAsync()).Select(f => f.UserId).ToArray();
            var users = await _user.Find(u => followersIds.Contains(u.Id) && u.DeletedAt == null && u.BlockedAt == null).ToListAsync();
            PaginatedFollowerResponseDto res = new PaginatedFollowerResponseDto
            {
                TotalElements = totalElements,
                Users = users.Select(u => u.AsDtoSearchedUser()).ToList(),
                Page = page,
                LastPage = LastPage,
                Size = limit,
                TotalPages = LastPage + 1
            };
            if (authUserId != null)
            {
                var authUserFollowings = await _followCollection.Find(f => f.UserId == authUserId && followersIds.Contains(f.FollowingId) ).ToListAsync();
                res.Users.ForEach(u =>
                {
                    u.IsFollowed = authUserFollowings.Any(f => f.FollowingId == u.Id);
                });
            }
            return res;

        }

        public async Task<PaginatedFollowerResponseDto> GetFollowing(string userId, int limit, int page)
        {
            var authUserId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var filter = _followCollection.Find(f => f.UserId == userId);
            long totalElements = await filter.CountDocumentsAsync();
            int LastPage = (int)Math.Ceiling((double)totalElements / limit) - 1;
            LastPage = LastPage < 0 ? 0 : LastPage;
            string[] followingIds = (await filter.Skip((page) * limit).Limit(limit).ToListAsync()).Select(f => f.FollowingId).ToArray();
            var users = await _user.Find(u => followingIds.Contains(u.Id) && u.DeletedAt == null && u.BlockedAt == null).ToListAsync();
            PaginatedFollowerResponseDto res = new PaginatedFollowerResponseDto
            {
                TotalElements = totalElements,
                Users = users.Select(u => u.AsDtoSearchedUser()).ToList(),
                Page = page,
                LastPage = LastPage,
                Size = limit,
                TotalPages = LastPage + 1
            };
            if (authUserId != null)
            {
                if(authUserId != userId)
                {
                    var authUserFollowings = await _followCollection.Find(f => f.UserId == authUserId && followingIds.Contains(f.FollowingId)).ToListAsync();
                    res.Users.ForEach(u =>
                    {
                        u.IsFollowed = authUserFollowings.Any(f => f.FollowingId == u.Id);
                    });
                }
                else
                {
                    res.Users.ForEach(u =>
                    {
                        u.IsFollowed = true;
                    });
                }
            }
            return res;
        }

        public Task<bool> IsFollowing(string userId, string followingId)
        {
            return _followCollection.Find(f => f.UserId == userId && f.FollowingId == followingId).AnyAsync();
        }
    }
}