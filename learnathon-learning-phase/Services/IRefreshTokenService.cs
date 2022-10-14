using learnathon_learning_phase.Models;
using MongoDB.Driver;

namespace learnathon_learning_phase.Services
{
    public interface IRefreshTokenService
    {
        
        Task<RefreshTokenModel> GetTokenByToken(string token);
        Task<RefreshTokenModel> StoreToken(RefreshTokenModel refreshTokenModel);

        Task<RefreshTokenModel> UpdateToken(string id ,RefreshTokenModel refreshTokenModel);
        Task<DeleteResult> DeleteToken(string id);

        Task<DeleteResult> DeleteTokenByUserId(string userId);

    }
}
