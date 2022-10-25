namespace Core.Dtos
{
    public class CacheNotificationConsumerDto
    {
        public string Type { get; set; } = string.Empty;
        public bool IsNotification { get; set; } = false;
        public string? UserId { get; set; } = string.Empty; // User who is being followed or blocked
        public string? RefUserId { get; set; } = string.Empty; // User who is following or blocking
        public TweetResponseDto? Tweet { get; set; } = null;
        public NotificationCreateDto? Notification { get; set; } = null;
    }
}