using Core.Dtos;
using Core.Models;

namespace Core.Interfaces;

public interface ITweetService
{
    Task<Tweets?> CreateTweet(TweetRequestDto tweet);
    Task<Tweets> UpdateTweet(Tweets tweet,TweetRequestDto tweetRequest);
    Task<Tweets?> GetTweetById(string id);
    Task DeleteTweet(Tweets tweet);
    Task<List<TweetResponseDto>> GetTweetsByUserId(string userId, int limit, int page);



}
