using Core.Models;

namespace Core.Dtos;


public class TweetCommentUserResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string ProfilePictureUrl { get; set; } = string.Empty;
    public string CoverPictureUrl { get; set; } = string.Empty;
}