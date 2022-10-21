using Core.Models;

namespace Core.Interfaces
{
    public interface IForgotPasswordService
    {
        Task StoreResetPasswordTokenAsync(User user, string token);
        Task<User?> GetUserByResetTokenAsync(string token);
        Task DeleteResetPasswordTokenAsync(string token);
        Task SentResetPasswordEmailAsync(User user, string url, string token);
    }
}