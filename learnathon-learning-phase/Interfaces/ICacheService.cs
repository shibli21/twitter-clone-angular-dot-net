using learnathon_learning_phase.Models;
using learnathon_learning_phase.Dtos;


namespace learnathon_learning_phase.Interfaces
{
    public interface ICacheService
    {
        Task<List<UserResponseDto>> GetOnlineUsers();
        Task SetUserOnline(UserResponseDto user);
    }
}
