using learnathon_learning_phase.Models;

namespace learnathon_learning_phase.Services
{
    public interface IUserService
    {
        Task RegisterUser(UserModel user);
        Task<UserModel> GetUserByEmail(string email);

        Task<UserModel> GetUserByUsername(string username);
    }
}
