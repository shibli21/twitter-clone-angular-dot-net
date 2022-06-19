using System.Security.Claims;
using learnathon_learning_phase.Extentions;
using learnathon_learning_phase.Models;
using MongoDB.Driver;

namespace learnathon_learning_phase.Services
{
    public class UserService : IUserService
    {
        private readonly IMongoCollection<UserModel> _user;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserService(IUserDatabaseSetting settings, IMongoClient mongoClient, IHttpContextAccessor httpContextAccessor)
        {
            var database = mongoClient.GetDatabase(settings.DatabaseName);
            _user = database.GetCollection<UserModel>(settings.UserCollectionName);
            _httpContextAccessor = httpContextAccessor;
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


        public async Task<UserModel> UpdateUser(UserModel user)
        {
            await _user.ReplaceOneAsync(u => u.Id == user.Id, user);
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


        public async Task<Object> GetPaginatedUsers(int? size, int? page)
        {
            var filter = Builders<UserModel>.Filter.Empty;
            var find = _user.Find(filter);
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

        public Task DeleteUser(string id)
        {
            return _user.DeleteOneAsync(user => user.Id == id);
        }

        public async Task<UserModel?> GetAuthUser()
        {

            UserModel? user;

            if (_httpContextAccessor.HttpContext != null)
            {
                string? id = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (id != null)
                {
                    user = await GetUserById(id);
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
}
