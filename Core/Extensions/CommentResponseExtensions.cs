

using Core.Dtos;
using Core.Models;

public static class CommentResponseExtensions
{
    public static CommentResponseDto AsDto(this Comments comment)
    {
        return new CommentResponseDto
        {
            Id = comment.Id,
            UserId = comment.UserId,
            TweetId = comment.TweetId,
            Comment = comment.Comment,
            CreatedAt = comment.CreatedAt
        };
    }
}
