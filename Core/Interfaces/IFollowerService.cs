using Core.Dtos;

namespace Core.Interfaces;
public interface IFollowerService
{
    Task<string> FollowByUserId(string followingId);
    Task<PaginatedUserResponseDto> GetFollowers(int limit, int page);
    Task<PaginatedUserResponseDto> GetFollowing(int limit, int page);
}