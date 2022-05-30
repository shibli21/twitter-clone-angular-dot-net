using learnathon_learning_phase.Models;
using MongoDB.Driver;

namespace learnathon_learning_phase.Services
{
    public class UserService : IUserService
    {
        private readonly IMongoCollection<UserModel> _user;

        public UserService(IUserDatabaseSetting settings, IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase(settings.DatabaseName);
            _user = database.GetCollection<UserModel>(settings.UserCollectionName);
        }
        public async Task RegisterUser(UserModel user)
        {
            await _user.InsertOneAsync(user);
        }

        public async Task<UserModel> GetUserByEmail(string email)
        {
            return await _user.Find(user => user.Email == email).FirstOrDefaultAsync();
        }

        public async Task<UserModel> GetUserByUsername(string username)
        {
            return await _user.Find(user => user.Username == username).FirstOrDefaultAsync();
        }
    }
}
