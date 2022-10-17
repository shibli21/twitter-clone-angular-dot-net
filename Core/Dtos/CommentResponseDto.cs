

namespace Core.Dtos;


public class CommentResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string TweetId { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public UserResponseDto? User { get; set; } = null;

}