using System.Security.Claims;
using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Config;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Infrastructure.Services;
public class UsersService : IUsersService
{
    private readonly IMongoCollection<User> _usersCollection;
    private readonly IMongoCollection<Follows> _followCollection;
    private readonly IMongoCollection<Blocks> _blockCollection;
    private readonly IHttpContextAccessor _httpContextAccessor;


    public UsersService(
        IOptions<TwitterCloneDbConfig> twitterCloneDatabaseSettings,
        IMongoClient mongoClient,
        IHttpContextAccessor httpContextAccessor)
    {
        var mongoDatabase = mongoClient.GetDatabase(twitterCloneDatabaseSettings.Value.DatabaseName);
        _usersCollection = mongoDatabase.GetCollection<User>(twitterCloneDatabaseSettings.Value.UserCollectionName);
        _followCollection = mongoDatabase.GetCollection<Follows>(twitterCloneDatabaseSettings.Value.FollowerCollectionName);
        _blockCollection = mongoDatabase.GetCollection<Blocks>(twitterCloneDatabaseSettings.Value.BlockCollectionName);
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<User?> GetUserAsync(string id)
    {
        return await _usersCollection.Find(user => user.Id == id).FirstOrDefaultAsync();
    }

    public async Task<User?> GetUserByNameAsync(string name)
    {
        return await _usersCollection.Find(user => user.UserName == name).FirstOrDefaultAsync();
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _usersCollection.Find(user => user.Email == email).FirstOrDefaultAsync();
    }


    public async Task<User> CreateUserAsync(User user)
    {
        await _usersCollection.InsertOneAsync(user);
        return user;
    }

    public async Task<long> GetFollowingCount(string id)
    {
        return await _followCollection.CountDocumentsAsync(follow => follow.UserId == id);
    }

    public async Task<long> GetFollowerCount(string id)
    {
        return await _followCollection.CountDocumentsAsync(follow => follow.FollowingId == id);
    }


    public async Task<UserResponseDto?> GetAuthUser()
    {
        UserResponseDto? user = null;

        if (_httpContextAccessor.HttpContext != null)
        {
            string? id = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (id != null)
            {
                User? userFromDb = await GetUserAsync(id);
                if (userFromDb != null && userFromDb.DeletedAt == null && userFromDb.BlockedAt == null)
                {
                    user = userFromDb.AsDto();
                    user.Followers = await GetFollowerCount(id);
                    user.Following = await GetFollowingCount(id);

                }


            }
        }
        return user;
    }

    public async Task<List<UserResponseDto>> MayFollowUser(int size)
    {
        List<UserResponseDto> users = new();
        if (_httpContextAccessor.HttpContext != null)
        {
            string? id = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (id != null)
            {
                var following = await _followCollection.Find(follow => follow.UserId == id).ToListAsync();
                var followingIds = following.Select(follow => follow.FollowingId).ToList();
                var blocked = await _blockCollection.Find(block => block.UserId == id || block.BlockedUserId == id).ToListAsync();
                var blockedMeIds = blocked.Where(block => block.BlockedUserId == id).Select(block => block.UserId).ToList();
                var myBlockedIds = blocked.Where(block => block.UserId == id).Select(block => block.BlockedUserId).ToList();
                var blockedIds = blockedMeIds.Concat(myBlockedIds).ToList();
                var mergeIds = followingIds.Union(blockedIds).ToArray();
                Console.WriteLine("mergeIds");
                users = (await _usersCollection.Find(user => !mergeIds.Contains(user.Id) && user.Id != id && user.DeletedAt == null && user.BlockedAt == null)
                    .Limit(size)
                    .ToListAsync()).Select(user => user.AsDto()).ToList();
            }
        }
        return users;
    }


    public async Task<User> UpdateGetUserAsync(string id, User user)
    {
        await _usersCollection.ReplaceOneAsync(u => u.Id == id, user);
        return user;
    }


    public async Task<PaginatedUserResponseDto> GetPaginatedUsers(int size, int page)
    {

        var filter = _usersCollection.Find(user => user.Role == "user" && user.BlockedAt == null && user.DeletedAt == null);
        var total = await filter.CountDocumentsAsync();

        int LastPage = (int)Math.Ceiling((double)total / size) - 1;
        LastPage = LastPage < 0 ? 0 : LastPage;
        return new PaginatedUserResponseDto()
        {
            TotalElements = total,
            Page = page,
            Size = size,
            LastPage = LastPage,
            TotalPages = LastPage + 1,
            Users = await filter.Skip(page * size)
                                .Limit(size)
                                .ToListAsync()
                                .ContinueWith(task => task.Result.Select(user => user.AsDto()).ToList())
        };
    }

    public async Task<PaginatedUserResponseDto> GetPaginatedAdmins(int size, int page)
    {

        var filter = _usersCollection.Find(user => user.Role == "admin" && user.BlockedAt == null && user.DeletedAt == null);
        var total = await filter.CountDocumentsAsync();

        int LastPage = (int)Math.Ceiling((double)total / size) - 1;
        LastPage = LastPage < 0 ? 0 : LastPage;
        return new PaginatedUserResponseDto()
        {
            TotalElements = total,
            Page = page,
            Size = size,
            LastPage = LastPage,
            TotalPages = LastPage + 1,
            Users = await filter.Skip(page * size)
                                .Limit(size)
                                .ToListAsync()
                                .ContinueWith(task => task.Result.Select(user => user.AsDto()).ToList())
        };
    }


}