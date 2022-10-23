namespace Core.Dtos
{
    public class CacheNotificationConsumerDto
    {
        public string Type { get; set; } = string.Empty;
        public bool IsNotification { get; set; } = false;
        public TweetResponseDto? Tweet { get; set; } = null;
        public NotificationCreateDto? Notification { get; set; } = null;
    }
}