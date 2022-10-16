

namespace Core.Dtos
{
    public class TweetResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string Tweet { get; set; } = string.Empty;
        public long CommentCount { get; set; } = 0;
        public long LikeCount { get; set; } = 0;
        public string[] History { get; set; } = new string[0];
        public DateTime CreatedAt { get; set; } = DateTime.Now;


    }
}