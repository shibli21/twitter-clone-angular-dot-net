using learnathon_learning_phase.Models;

namespace learnathon_learning_phase.Services
{
    public interface IUserService
    {
        void RegisterUser(UserModel user);
        UserModel GetUserByEmail(string email);

        UserModel GetUserByUsername(string username);
    }
}
