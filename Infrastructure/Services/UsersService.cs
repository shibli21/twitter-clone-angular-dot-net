using System.Security.Claims;
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
    private readonly IHttpContextAccessor _httpContextAccessor;


    public UsersService(
        IOptions<TwitterCloneDbConfig> twitterCloneDatabaseSettings,
        IMongoClient mongoClient,
        IHttpContextAccessor httpContextAccessor)
    {
        var mongoDatabase = mongoClient.GetDatabase(twitterCloneDatabaseSettings.Value.DatabaseName);
        _usersCollection = mongoDatabase.GetCollection<User>(twitterCloneDatabaseSettings.Value.UserCollectionName);
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


    public async Task<User?> GetAuthUser()
    {
        User? user;

        if (_httpContextAccessor.HttpContext != null)
        {
            string? name = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine("name", name);
            if (name != null)
            {
                user = await GetUserByNameAsync(name);
            }
            else
            {
                user = null;
            }
            return user;
        }
        return null;
    }
}