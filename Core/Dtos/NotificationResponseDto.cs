namespace Core.Dtos
{
    public class NotificationResponseDto
    {
        public string Id { get; set; } = String.Empty;
        public string Type { get; set; } = String.Empty;
        public string UserId { get; set; } = String.Empty;
        public string RefUserId { get; set; } = String.Empty;
        public string? TweetId { get; set; } = null;
        public bool IsRead { get; set; } = false;
        public UserResponseDto? RefUser { get; set; } = null;
        public string Message { get; set; } = String.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}