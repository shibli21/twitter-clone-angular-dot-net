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
        public void RegisterUser(UserModel user)
        {
            _user.InsertOne(user);
        }
        public UserModel GetUserByEmail(string email)
        {
            return _user.Find(user => user.Email == email).FirstOrDefault();
        }
        public UserModel GetUserByUsername(string username)
        {
            return _user.Find(user => user.Username == username).FirstOrDefault();
        }
    }
}
