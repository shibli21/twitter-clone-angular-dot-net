using Core.Dtos;

namespace Core.Interfaces
{
    public interface ILikeCommentService
    {

        Task<string> LikeTweet(string id);
        Task<List<UserResponseDto>> GetLikedUsers(int max, int page, string tweetId);
        Task<CommentResponseDto?> Comment(string id, string comment);
        Task<bool> DeleteComment(string commentId);
        Task<CommentResponseDto?> UpdateComment(string commentId, string comment);
        Task<List<CommentResponseDto>> GetComments(int max, int page, string tweetId);
    }
}