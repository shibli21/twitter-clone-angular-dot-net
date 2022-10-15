using learnathon_learning_phase.Models;
using learnathon_learning_phase.Dtos;
using learnathon_learning_phase.Dtos.Tweet;

namespace learnathon_learning_phase.Extentions
{
    public static class Extensions
    {
        public static UserResponseDto AsDto(this UserModel user)
        {
            return new UserResponseDto
            {
                Username = user.Username,
                Email = user.Email,
                DateOfBirth = user.DateOfBirth,
                Id = user.Id
            };
        }
        public static TweetResponseDto AsDto(this TweetModel tweet)
        {
            return new TweetResponseDto
            {
                Id = tweet.Id,
                UserId = tweet.UserId,
                Tweet = tweet.Tweet,
                Type = tweet.Type,
                CommnetCount = tweet.CommentCount,
                LikeCount = tweet.LikeCount,
                History = tweet.History,
                CreatedAt = tweet.CreatedAt
            };
        }
    }
}