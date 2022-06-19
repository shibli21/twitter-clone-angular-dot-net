using learnathon_learning_phase.Models;

namespace learnathon_learning_phase.Services
{
    public interface IRefreshTokenService
    {
        Task<RefreshTokenModel> GetTokenByToken(string token);
        Task<RefreshTokenModel> StoreToken(RefreshTokenModel refreshTokenModel);

        Task<RefreshTokenModel> UpdateToken(string id ,RefreshTokenModel refreshTokenModel);
    }
}
