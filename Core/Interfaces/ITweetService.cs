using Core.Dtos;
using Core.Models;

namespace Core.Interfaces;

public interface ITweetService
{
    Task CreateTweet(TweetRequestDto tweet);
    Task<Tweets> UpdateTweet(Tweets tweet,TweetRequestDto tweetRequest);
    Task<Tweets?> GetTweetById(string id);
    Task DeleteTweet(string id);
}
