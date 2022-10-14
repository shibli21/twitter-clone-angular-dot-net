using learnathon_learning_phase.Models;
using learnathon_learning_phase.Dtos;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace learnathon_learning_phase.Services
{
    public class RefreshTokenService : IRefreshTokenService
    {
        private readonly IMongoCollection<RefreshTokenModel> _refreshTokenCollection;

        public RefreshTokenService(
            IOptions<NoobMastersDatabaseSettings> noobCloneDatabaseSettings,
             IMongoClient mongoClient

             )
        {

            var mongoDatabase = mongoClient.GetDatabase(noobCloneDatabaseSettings.Value.DatabaseName);

            _refreshTokenCollection = mongoDatabase.GetCollection<RefreshTokenModel>(noobCloneDatabaseSettings.Value.RefreshTokenCollectionName);
        }

        public async Task<DeleteResult> DeleteToken(string id)
        {
            return await _refreshTokenCollection.DeleteOneAsync(refreshToken => refreshToken.Id == id);
        }

        public async Task<RefreshTokenModel> GetTokenByToken(string token)
        {
            return await _refreshTokenCollection.Find(refreshToken => refreshToken.Token == token).FirstOrDefaultAsync();
        }

        public async Task<RefreshTokenModel> StoreToken(RefreshTokenModel refreshTokenModel)
        {
            await _refreshTokenCollection.InsertOneAsync(refreshTokenModel);
            return refreshTokenModel;
        }

        public async Task<RefreshTokenModel> UpdateToken(string id, RefreshTokenModel refreshTokenModel)
        {
            await _refreshTokenCollection.ReplaceOneAsync(u => u.Id == id, refreshTokenModel);
            return refreshTokenModel;
        }

        public async Task<DeleteResult> DeleteTokenByUserId(string userId)
        {
            return await _refreshTokenCollection.DeleteManyAsync(refreshToken => refreshToken.UserId == userId);
        }
    }
}
