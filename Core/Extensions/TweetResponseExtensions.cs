using Core.Dtos;
using Core.Models;


public static class TweetResponseExtensions
{
    public static TweetResponseDto AsDto(this Tweets tweet)
    {
        return new TweetResponseDto
        {
            Id = tweet.Id,
            UserId = tweet.UserId,
            Tweet = tweet.Tweet,
            Type = tweet.Type,
            CommentCount = tweet.CommentCount,
            LikeCount = tweet.LikeCount,
            RetweetCount = tweet.RetweetCount,
            History = tweet.History,
            CreatedAt = tweet.CreatedAt
        };
    }
}
