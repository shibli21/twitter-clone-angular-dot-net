namespace Core.Dtos
{
    public class NotificationCreateDto
    {
        public string Type { get; set; } = String.Empty;
        public string UserId { get; set; } = String.Empty;
        public string RefUserId { get; set; } = String.Empty;
        public string? TweetId { get; set; } = null;

    }
}