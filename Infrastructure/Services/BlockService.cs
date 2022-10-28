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
    public class BlockService : IBlockService
    {

        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMongoCollection<Blocks> _blockCollection;

        private readonly IMongoCollection<Follows> _followCollection;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public BlockService(IOptions<TwitterCloneDbConfig> twitterCloneDatabaseSettings,
        IMongoClient mongoClient,
        IHttpContextAccessor httpContextAccessor)
        {
            var mongoDatabase = mongoClient.GetDatabase(twitterCloneDatabaseSettings.Value.DatabaseName);
            _usersCollection = mongoDatabase.GetCollection<User>(twitterCloneDatabaseSettings.Value.UserCollectionName);
            _blockCollection = mongoDatabase.GetCollection<Blocks>(twitterCloneDatabaseSettings.Value.BlockCollectionName);
            _followCollection = mongoDatabase.GetCollection<Follows>(twitterCloneDatabaseSettings.Value.FollowerCollectionName);
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<string> BlockByUser(string blockingId)
        {
            string msg = "Something went wrong";
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId != null)
                {
                    User? user = await _usersCollection.Find(user => user.Id == blockingId).FirstOrDefaultAsync();
                    if (user != null)
                    {
                        Blocks block = _blockCollection.Find(block => block.UserId == userId && block.BlockedUserId == blockingId).FirstOrDefault();
                        if (block == null)
                        {
                            block = new Blocks
                            {
                                UserId = userId,
                                BlockedUserId = blockingId
                            };
                            await _blockCollection.InsertOneAsync(block);
                            await _followCollection.DeleteOneAsync(follow => follow.UserId == userId && follow.FollowingId == blockingId);
                            await _followCollection.DeleteOneAsync(follow => follow.UserId == blockingId && follow.FollowingId == userId);
                            msg = "User blocked successfully";
                        }
                        else
                        {
                            await _blockCollection.DeleteOneAsync(block => block.UserId == userId && block.BlockedUserId == blockingId);
                            msg = "User unblocked successfully";
                        }
                    }
                }
            }
            return msg;
        }


        public async Task<PaginatedUserResponseDto> GetAdminBlockedUsers(int size, int page)
        {
            var filter = _usersCollection.Find(user => user.BlockedAt != null && user.DeletedAt == null);
            var total = await filter.CountDocumentsAsync();
            int LastPage = (int)Math.Ceiling((double)total / size) -1;
            LastPage = LastPage < 0 ? 0 : LastPage;
            int totalPages = LastPage + 1;
            return new PaginatedUserResponseDto()
            {
                TotalElements = total,
                Page = page,
                Size = size,
                LastPage = LastPage,
                TotalPages = totalPages,
                Users = await filter.Skip(page * size)
                                    .Limit(size)
                                    .ToListAsync()
                                    .ContinueWith(task => task.Result.Select(user => user.AsDto()).ToList())
            };
        }


        public async Task<PaginatedUserResponseDto> GetUserBlockedUsers(int size, int page)
        {
            PaginatedUserResponseDto paginatedUserResponseDto = new PaginatedUserResponseDto();
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId != null)
                {
                    var filter = _usersCollection.Find(user => user.Id == userId);
                    User? user = await filter.FirstOrDefaultAsync();
                    if (user != null)
                    {
                        var blockedUsers = _blockCollection.Find(block => block.UserId == userId);
                        var TotalElements = await blockedUsers.CountDocumentsAsync();
                        int LastPage = (int)Math.Ceiling((double)TotalElements / size) - 1;
                        LastPage = LastPage < 0 ? 0 : LastPage;
                        int totalPages = LastPage + 1;
                        string[] blockedUsersIds = await blockedUsers.Skip(page * size)
                                                                    .Limit(size)
                                                                    .ToListAsync()
                                                                    .ContinueWith(task => task.Result.Select(block => block.BlockedUserId).ToArray());

                        List<UserResponseDto> users = await _usersCollection.Find(user => blockedUsersIds.Contains(user.Id) && user.DeletedAt == null)
                                                                            .ToListAsync()
                                                                            .ContinueWith(task => task.Result.Select(user => user.AsDto()).ToList());
                        paginatedUserResponseDto = new PaginatedUserResponseDto()
                        {
                            TotalElements = TotalElements,
                            Page = page,
                            Size = size,
                            LastPage = LastPage,
                            TotalPages = totalPages,
                            Users = users
                        };
                    }
                }

            }
            return paginatedUserResponseDto;
        }

        public Task<bool> IsBlocked(string userId, string blockedUserId)
        {
            return _blockCollection.Find(block => (block.UserId == userId && block.BlockedUserId == blockedUserId) || (block.UserId == blockedUserId && block.BlockedUserId == userId)).AnyAsync();
        }

        public async Task<string[]> GetBlockedUsersIds(string userId)
        {
            var blocked = await _blockCollection.Find(block => block.UserId == userId || block.BlockedUserId == userId).ToListAsync();
            var blockedMeIds = blocked.Where(block => block.BlockedUserId == userId).Select(block => block.UserId).ToList();
            var myBlockedIds = blocked.Where(block => block.UserId == userId).Select(block => block.BlockedUserId).ToList();
            var blockedIds = blockedMeIds.Concat(myBlockedIds).ToArray();
            return blockedIds;

        }
    }
}