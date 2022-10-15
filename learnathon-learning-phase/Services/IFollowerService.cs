using learnathon_learning_phase.Dtos;
using MongoDB.Driver;

namespace learnathon_learning_phase.Services
{
    public interface IFollowerService
    {
        Task FollowByUserId(string followingId);
        Task UnFollowByUserId(string followingId);
        Task<List<UserResponseDto>> GetFollowers(int limit, int page);
        Task<List<UserResponseDto>> GetFollowing( int limit, int page);
    }
}