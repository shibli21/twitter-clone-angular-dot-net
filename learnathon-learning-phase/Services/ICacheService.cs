using learnathon_learning_phase.Models;

namespace learnathon_learning_phase.Services
{
    public interface ICacheService
    {
        Task<List<UserResponseDto>> GetOnlineUsers();
        Task SetUserOnline(UserResponseDto user);
    }
}
