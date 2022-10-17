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
                    user.Followers = await _followCollection.CountDocumentsAsync(f => f.FollowingId == id);
                    user.Following = await _followCollection.CountDocumentsAsync(f => f.UserId == id);
                }
            }
        }
        return user;
    }
}