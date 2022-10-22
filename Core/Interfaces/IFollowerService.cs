using Core.Dtos;

namespace Core.Interfaces;
public interface IFollowerService
{
    Task<string> FollowByUserId(string followingId);
    Task<PaginatedUserResponseDto> GetFollowers(string userId,int limit, int page);
    Task<PaginatedUserResponseDto> GetFollowing(string userId,int limit, int page);
    Task<bool> IsFollowing(string userId, string followingId);
}