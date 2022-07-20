using learnathon_learning_phase.Models;
using MongoDB.Driver;

namespace learnathon_learning_phase.Services
{
    public interface IUserService
    {
        Task<UserModel> RegisterUser(UserModel user);
        Task<UserModel> UpdateUser(UserModel user);
        Task<DeleteResult> DeleteUser(string id);
        Task<UserModel> GetUserById(string id);
        Task<Object> GetPaginatedUsers(int? size, int? page);
        Task<UserModel> GetUserByEmail(string email);
        Task<UserModel> GetUserByUsername(string username);
        Task<UserModel?> GetAuthUser();
    }
}
