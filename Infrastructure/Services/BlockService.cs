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
            var filter = _usersCollection.Find(user => user.Role == "user" && user.BlockedAt != null && user.DeletedAt == null);
            int LastPage = (int)Math.Ceiling((double)await filter.CountDocumentsAsync() / size) - 1;
            LastPage = LastPage < 0 ? 0 : LastPage;
            return new PaginatedUserResponseDto()
            {
                TotalElements = await filter.CountDocumentsAsync(),
                Page = page,
                Size = size,
                LastPage = LastPage,
                TotalPages = (int)Math.Ceiling((double)await filter.CountDocumentsAsync() / size),
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
                        int LastPage = (int)Math.Ceiling((double)await blockedUsers.CountDocumentsAsync() / size) - 1;
                        LastPage = LastPage < 0 ? 0 : LastPage;
                        int TotalPages = (int)Math.Ceiling((double)await blockedUsers.CountDocumentsAsync() / size);
                        long TotalElements = await blockedUsers.CountDocumentsAsync();
                        string[] blockedUsersIds = await blockedUsers.Skip(page * size)
                                                                    .Limit(size)
                                                                    .ToListAsync()
                                                                    .ContinueWith(task => task.Result.Select(block => block.BlockedUserId).ToArray());

                        List<UserResponseDto> users = await _usersCollection.Find(user => blockedUsersIds.Contains(user.Id))
                                                                            .ToListAsync()
                                                                            .ContinueWith(task => task.Result.Select(user => user.AsDto()).ToList());
                        paginatedUserResponseDto = new PaginatedUserResponseDto()
                        {
                            TotalElements = TotalElements,
                            Page = page,
                            Size = size,
                            LastPage = LastPage,
                            TotalPages = TotalPages,
                            Users = users
                        };
                    }
                }

            }
            return paginatedUserResponseDto;
        }
    }
}