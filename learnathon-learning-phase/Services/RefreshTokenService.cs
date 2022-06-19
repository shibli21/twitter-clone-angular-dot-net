using learnathon_learning_phase.Models;
using MongoDB.Driver;

namespace learnathon_learning_phase.Services
{
    public class RefreshTokenService : IRefreshTokenService
    {
        private readonly IMongoCollection<RefreshTokenModel> _refresh_token;

        public RefreshTokenService(IRefreshTokenDatabaseSetting settings, IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase(settings.DatabaseName);
            _refresh_token = database.GetCollection<RefreshTokenModel>(settings.RefreshTokenCollectionName);
        }

        public async Task<DeleteResult> DeleteToken(string id)
        {
            return await _refresh_token.DeleteOneAsync(refreshToken => refreshToken.Id == id);
        }

        public async Task<RefreshTokenModel> GetTokenByToken(string token)
        {
            return await _refresh_token.Find(refreshToken => refreshToken.Token == token).FirstOrDefaultAsync();
        }

        public async Task<RefreshTokenModel> StoreToken(RefreshTokenModel refreshTokenModel)
        {
            await _refresh_token.InsertOneAsync(refreshTokenModel);
            return refreshTokenModel;
        }

        public async Task<RefreshTokenModel> UpdateToken(string id ,RefreshTokenModel refreshTokenModel)
        {
            await _refresh_token.ReplaceOneAsync(u => u.Id == id, refreshTokenModel);
            return refreshTokenModel;
        }
    }
}
