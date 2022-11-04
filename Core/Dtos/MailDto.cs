using Core.Models;

namespace Core.Dtos
{
    public class MailDto
    {
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public User User { get; set; } = new User();
        public string ResetPasswordUrl { get; set; } = string.Empty;
    }
}