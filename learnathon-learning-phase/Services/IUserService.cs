using learnathon_learning_phase.Models;

namespace learnathon_learning_phase.Services
{
    public interface IUserService
    {
        Task<UserModel> RegisterUser(UserModel user);
        Task<UserModel> UpdateUser(UserModel user);
        Task<UserModel> GetUserById(string id);
        Object GetPaginatedUsers(int? size, int? page);
        Task<UserModel> GetUserByEmail(string email);
        Task<UserModel> GetUserByUsername(string username);
    }
}
