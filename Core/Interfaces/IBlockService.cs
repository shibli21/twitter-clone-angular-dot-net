using Core.Dtos;

namespace Core.Interfaces
{
    public interface IBlockService
    {
        Task<PaginatedUserResponseDto> GetAdminBlockedUsers(int size, int page);
        Task<PaginatedUserResponseDto> GetUserBlockedUsers(int size, int page);
        Task<string> BlockByUser(string blockingId);
        Task<bool> IsBlocked(string userId, string blockedUserId);
        Task<string[]> GetBlockedUsersIds(string userId);
    }
}