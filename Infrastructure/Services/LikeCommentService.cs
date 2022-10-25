using System.Security.Claims;
using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Config;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Infrastructure.Services
{
    public class LikeCommentService : ILikeCommentService
    {

        private readonly IMongoCollection<LikeRetweets> _likeRetweetCollection;
        private readonly IMongoCollection<Comments> _commentCollection;
        private readonly IMongoCollection<User> _user;
        private readonly IMongoCollection<Tweets> _tweetCollection;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public LikeCommentService(IOptions<TwitterCloneDbConfig> twitterCloneDbConfig, IMongoClient mongoClient, IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            var database = mongoClient.GetDatabase(twitterCloneDbConfig.Value.DatabaseName);
            _likeRetweetCollection = database.GetCollection<LikeRetweets>(twitterCloneDbConfig.Value.LikeRetweetCollectionName);
            _commentCollection = database.GetCollection<Comments>(twitterCloneDbConfig.Value.CommentCollectionName);
            _user = database.GetCollection<User>(twitterCloneDbConfig.Value.UserCollectionName);
            _tweetCollection = database.GetCollection<Tweets>(twitterCloneDbConfig.Value.TweetCollectionName);
        }

        public async Task<CommentResponseDto?> Comment(string userId, Tweets tweet, string comment)
        {
            Comments commentObj = new Comments
            {
                TweetId = tweet.Id,
                Comment = comment,
                UserId = userId,
                CreatedAt = DateTime.Now
            };
            await _commentCollection.InsertOneAsync(commentObj);
            tweet.CommentCount += 1;
            await _tweetCollection.ReplaceOneAsync(x => x.Id == tweet.Id, tweet);
            return commentObj.AsDto();

        }

        public async Task<Comments?> GetCommentById(string commentId)
        {
            return await _commentCollection.Find(x => x.Id == commentId).FirstOrDefaultAsync();
        }

        public async Task<CommentResponseDto?> UpdateComment(string commentId, string comment)
        {
            CommentResponseDto? commentResponseDto = null;
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId != null)
                {
                    Comments commentRes = await _commentCollection.Find(x => x.Id == commentId && x.UserId == userId).FirstOrDefaultAsync();
                    if (comment != null)
                    {
                        commentRes.Comment = comment;
                        commentRes.UpdatedAt = DateTime.Now;
                        await _commentCollection.ReplaceOneAsync(x => x.Id == commentId, commentRes);
                        return commentRes.AsDto();
                    }
                }
            }
            return commentResponseDto;
        }
        public async Task<bool> DeleteComment(Comments comment, Tweets tweet)
        {
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId != null)
                {

                    tweet.CommentCount -= 1;
                    await _tweetCollection.ReplaceOneAsync(x => x.Id == comment.TweetId, tweet);

                    await _commentCollection.DeleteOneAsync(x => x.Id == comment.Id);
                    return true;
                }

            }
            return false;
        }


        public async Task<PaginatedCommentResponseDto> GetComments(int max, int page, string tweetId)
        {
            var filter = _commentCollection.Find(x => x.TweetId == tweetId);
            int LastPage = (int)Math.Ceiling((double)await filter.CountDocumentsAsync() / max) - 1;
            LastPage = LastPage < 0 ? 0 : LastPage;
            PaginatedCommentResponseDto commentResponse = new PaginatedCommentResponseDto()
            {
                TotalElements = await filter.CountDocumentsAsync(),
                Page = page,
                Size = max,
                LastPage = LastPage,
                TotalPages = (int)Math.Ceiling((double)await filter.CountDocumentsAsync() / max),
                Comments = (await filter.Skip(page * max)
                                    .Limit(max)
                                    .ToListAsync())
                                    .Select(x => x.AsDto()).ToList()
            };
            if (commentResponse.Comments != null)
            {
                foreach (CommentResponseDto comment in commentResponse.Comments)
                {
                    User? user = await _user.Find(x => x.Id == comment.UserId && x.DeletedAt == null && x.BlockedAt == null).FirstOrDefaultAsync();
                    if (user != null)
                    {
                        comment.User = user.AsDtoTweetComment();
                    }
                    else
                    {
                        commentResponse.Comments.Remove(comment);
                    }
                }
            }
            return commentResponse;
        }

        public async Task<string> LikeTweet(Tweets tweet, string userId)
        {
            string msg = "";

            var likeRetweet = await _likeRetweetCollection.Find(x => x.UserId == userId && x.TweetId == tweet.Id).FirstOrDefaultAsync();
            if (likeRetweet == null)
            {
                likeRetweet = new LikeRetweets
                {
                    UserId = userId,
                    TweetId = tweet.Id,
                    IsLiked = true,
                    IsRetweeted = false,
                };
                await _likeRetweetCollection.InsertOneAsync(likeRetweet);
                tweet.LikeCount += 1;
                await _tweetCollection.ReplaceOneAsync(x => x.Id == tweet.Id, tweet);
                msg = "Tweet liked";

            }
            else
            {
                if (likeRetweet.IsLiked)
                {
                    await _likeRetweetCollection.DeleteOneAsync(x => x.Id == likeRetweet.Id);
                    tweet.LikeCount -= 1;
                    await _tweetCollection.ReplaceOneAsync(x => x.Id == tweet.Id, tweet);
                    msg = "Tweet unliked";
                }
                else
                {
                    likeRetweet.IsLiked = true;
                    await _likeRetweetCollection.ReplaceOneAsync(x => x.Id == likeRetweet.Id, likeRetweet);
                    tweet.LikeCount += 1;
                    await _tweetCollection.ReplaceOneAsync(x => x.Id == tweet.Id, tweet);
                    msg = "Tweet liked";

                }
            }


            return msg;
        }



        public async Task<List<TweetCommentUserResponseDto>> GetLikedUsers(int max, int page, string tweetId)
        {
            string[] likedUsersId = (await _likeRetweetCollection.Find(x => x.TweetId == tweetId && x.IsLiked).Skip((page) * max).Limit(max).ToListAsync()).Select(f => f.UserId).ToArray();
            return (await _user.Find(u => likedUsersId.Contains(u.Id) && u.BlockedAt == null && u.DeletedAt == null).ToListAsync()).Select(u => u.AsDtoTweetComment()).ToList();
        }

        public async Task<LikedOrRetweetedDto> IsLikedOrRetweeted(string tweetId)
        {
            LikedOrRetweetedDto likeRetweetResponse = new LikedOrRetweetedDto();
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId != null)
                {
                    LikeRetweets? likeRetweet = await _likeRetweetCollection.Find(x => x.UserId == userId && x.TweetId == tweetId).FirstOrDefaultAsync();
                    if (likeRetweet != null)
                    {
                        likeRetweetResponse = new LikedOrRetweetedDto
                        {
                            IsLiked = likeRetweet.IsLiked,
                            IsRetweeted = likeRetweet.IsRetweeted
                        };
                    }
                }
            }
            return likeRetweetResponse;
        }

    }
}