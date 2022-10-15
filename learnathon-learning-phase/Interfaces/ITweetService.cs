using learnathon_learning_phase.Dtos.Tweet;
using learnathon_learning_phase.Models;

namespace learnathon_learning_phase.Interfaces
{
    public interface ITweetService
    {
        Task CreateTweet(TweetRequestDto tweet);
        Task<TweetModel> UpdateTweet(TweetModel tweet,TweetRequestDto tweetRequest);
        Task<TweetModel?> GetTweetById(string id);
        Task DeleteTweet(string id);
    }
}