using Core.Interfaces;
using Core.Models;
using Infrastructure.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Infrastructure.Services;
public class RefreshTokenService : IRefreshTokenService
{
    private readonly IMongoCollection<RefreshToken> _refreshTokenCollection;

    public RefreshTokenService(IOptions<TwitterCloneDbConfig> twitterCloneDbConfig, IMongoClient mongoClient)
    {
        var mongoDatabase = mongoClient.GetDatabase(twitterCloneDbConfig.Value.DatabaseName);
        _refreshTokenCollection = mongoDatabase.GetCollection<RefreshToken>(twitterCloneDbConfig.Value.RefreshTokenCollectionName);
    }

    public async Task<DeleteResult> DeleteToken(string id)
    {
        return await _refreshTokenCollection.DeleteOneAsync(refreshToken => refreshToken.Id == id);
    }

    public async Task<RefreshToken> GetTokenByToken(string token)
    {
        return await _refreshTokenCollection.Find(refreshToken => refreshToken.Token == token).FirstOrDefaultAsync();
    }

    public async Task<RefreshToken> StoreToken(RefreshToken refreshToken)
    {
        await _refreshTokenCollection.InsertOneAsync(refreshToken);
        return refreshToken;
    }

    public async Task<RefreshToken> UpdateToken(string id, RefreshToken refreshToken)
    {
        await _refreshTokenCollection.ReplaceOneAsync(u => u.Id == id, refreshToken);
        return refreshToken;
    }
}