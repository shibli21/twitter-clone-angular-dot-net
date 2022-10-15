using Core.Models;
using MongoDB.Driver;

namespace Core.Interfaces;
public interface IRefreshTokenService
{
    Task<RefreshToken> GetTokenByToken(string token);
    Task<RefreshToken> StoreToken(RefreshToken refreshToken);
    Task<RefreshToken> UpdateToken(string id, RefreshToken refreshToken);
    Task<DeleteResult> DeleteToken(string id);
}
