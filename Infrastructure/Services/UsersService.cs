using Core.Interfaces;
using Core.Models;
using Infrastructure.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

public class UsersService : IUsersService
{
    private readonly IMongoCollection<User> _usersCollection;


    public UsersService(IOptions<TwitterCloneDbConfig> twitterCloneDatabaseSettings, IMongoClient mongoClient)
    {
        var mongoDatabase = mongoClient.GetDatabase(twitterCloneDatabaseSettings.Value.DatabaseName);
        _usersCollection = mongoDatabase.GetCollection<User>(twitterCloneDatabaseSettings.Value.UserCollectionName);
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

}