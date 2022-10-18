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
    private readonly IHttpContextAccessor _httpContextAccessor;


    public UsersService(
        IOptions<TwitterCloneDbConfig> twitterCloneDatabaseSettings,
        IMongoClient mongoClient,
        IHttpContextAccessor httpContextAccessor)
    {
        var mongoDatabase = mongoClient.GetDatabase(twitterCloneDatabaseSettings.Value.DatabaseName);
        _usersCollection = mongoDatabase.GetCollection<User>(twitterCloneDatabaseSettings.Value.UserCollectionName);
        _followCollection = mongoDatabase.GetCollection<Follows>(twitterCloneDatabaseSettings.Value.FollowerCollectionName);
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
                user = (await GetUserAsync(id))?.AsDto();
                if (user != null)
                {
                    user.Followers = await GetFollowerCount(id);
                    user.Following = await GetFollowingCount(id);
                }
            }
        }
        return user;
    }

    public async Task<List<UserResponseDto>> MightFollowUser(int size)
    {
        List<UserResponseDto> users = new();
        if (_httpContextAccessor.HttpContext != null)
        {
            string? id = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (id != null)
            {
                var following = await _followCollection.Find(follow => follow.UserId == id).ToListAsync();
                var followingIds = following.Select(follow => follow.FollowingId).ToList();
                users = (await _usersCollection.Find(user => !followingIds.Contains(user.Id) && user.Id != id)
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


        public async Task<PaginatedUserResponseDto> GetPaginatedUsers(int? size, int? page)
        {
            var filter = Builders<User>.Filter.Empty;
            var find = _usersCollection.Find(filter);
            int perPage = size.GetValueOrDefault();
            var total_elements = await find.CountDocumentsAsync();

            return new PaginatedUserResponseDto()
            {
                TotalElements = total_elements,
                Page = page.GetValueOrDefault(0),
                Size = perPage,
                LastPage = (int)Math.Ceiling((double)total_elements / perPage) - 1,
                TotalPages = (int)Math.Ceiling((double)total_elements / perPage),
                Users = find.Skip(page * perPage)
                            .Limit(perPage)
                            .ToList()
                            .AsEnumerable()
                            .Select(user => user.AsDto())
                            .ToList()
            };


        }


}