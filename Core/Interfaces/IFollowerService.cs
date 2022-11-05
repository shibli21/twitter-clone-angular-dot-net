using Core.Dtos;

namespace Core.Interfaces;
public interface IFollowerService
{
    Task<string> FollowByUserId(string userId,string followingId);
    Task<PaginatedFollowerResponseDto> GetFollowers(string userId,int limit, int page);
    Task<PaginatedFollowerResponseDto> GetFollowing(string userId,int limit, int page);
    Task<bool> IsFollowing(string userId, string followingId);
}