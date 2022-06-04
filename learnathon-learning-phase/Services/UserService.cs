using learnathon_learning_phase.Extentions;
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
        public async Task<List<UserModel>> GetUsers(int limit, int page)
        {
            var users = await _user.Find(user => true)
                .Skip((page - 1) * limit)
                .Limit(limit)
                .ToListAsync();
            return users;
            // return await _user.Find(user => true).Skip().ToListAsync();
        }
        public async Task<UserModel> RegisterUser(UserModel user)
        {
            await _user.InsertOneAsync(user);
            return user;
        }

        public async Task<UserModel> GetUserByEmail(string email)
        {
            return await _user.Find(user => user.Email == email).FirstOrDefaultAsync();
        }

        public async Task<UserModel> GetUserByUsername(string username)
        {
            return await _user.Find(user => user.Username == username).FirstOrDefaultAsync();
        }

        public async Task<UserModel> GetUserById(string id)
        {
            return await _user.Find(user => user.Id == id).FirstOrDefaultAsync();
        }


        public Object GetPaginatedUsers(int? size, int? page)
        {
            var filter = Builders<UserModel>.Filter.Empty;
            var find = _user.Find(filter);
            int perPage = size.GetValueOrDefault();
            var total_elements = find.CountDocuments();

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
}
