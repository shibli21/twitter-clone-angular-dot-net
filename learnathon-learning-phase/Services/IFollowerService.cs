using learnathon_learning_phase.Models;
using MongoDB.Driver;

namespace learnathon_learning_phase.Services
{
    public interface IFollowerService
    {
        Task FollowByUserId(string followingId);
        Task UnFollowByUserId(string followingId);
        Task<List<FollowModel>> GetFollowers();
        Task<List<FollowModel>> GetFollowing();
    }
}