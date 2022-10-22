using Core.Dtos;
using Core.Models;

namespace Core.Interfaces;

public interface ITweetService
{
    Task<Tweets?> CreateTweet(TweetRequestDto tweet);
    Task<Tweets?> CreateRetweet(string userId, Tweets refTweet , RetweetRequestDto tweet);
    Task<Tweets> UpdateTweet(Tweets tweet, TweetRequestDto tweetRequest);
    Task<Tweets> UpdateRetweet(Tweets tweet, RetweetRequestDto tweetRequest);
    Task<Tweets> UpdateTweetAsync(string id, Tweets tweet);
    Task<Tweets?> GetTweetById(string id);
    Task DeleteTweet(Tweets tweet);
}
