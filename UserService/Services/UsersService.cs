using Microsoft.Extensions.Options;
using MongoDB.Driver;

public class UsersService : IUsersService
{
    private readonly IMongoCollection<User> _user;


    public UsersService(IOptions<TwitterCloneDatabaseSettings> twitterCloneDatabaseSettings, IMongoClient mongoClient)
    {
        var mongoDatabase = mongoClient.GetDatabase(twitterCloneDatabaseSettings.Value.DatabaseName);
        _user = mongoDatabase.GetCollection<User>(twitterCloneDatabaseSettings.Value.UserCollectionName);
    }

    public Task<IEnumerable<User>> GetUsersAsync()
    {
        return Task.FromResult(_user.Find(user => true).ToEnumerable());
    }

}