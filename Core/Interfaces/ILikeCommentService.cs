using Core.Dtos;
using Core.Models;

namespace Core.Interfaces
{
    public interface ILikeCommentService
    {

        Task<LikedOrRetweetedDto> LikeTweet(Tweets tweet, string userId);
        Task<List<TweetCommentUserResponseDto>> GetLikedUsers(int max, int page, string tweetId);
        Task<CommentResponseDto?> Comment(string userId, Tweets tweet, string comment);
        Task<Comments?> GetCommentById(string commentId);
        Task<bool> DeleteComment(Comments comment, Tweets tweet);
        Task<CommentResponseDto?> UpdateComment(string commentId, string comment);
        Task<PaginatedCommentResponseDto> GetComments(int max, int page, string tweetId);
        Task<LikedOrRetweetedDto> IsLikedOrRetweeted(string tweetId);
    }
}