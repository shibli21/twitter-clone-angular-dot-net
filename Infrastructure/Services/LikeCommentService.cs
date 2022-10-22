using System.Security.Claims;
using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Config;
using MassTransit;
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
        private readonly IBus _bus;
        public LikeCommentService(IOptions<TwitterCloneDbConfig> twitterCloneDbConfig, IMongoClient mongoClient, IHttpContextAccessor httpContextAccessor, IBus bus)
        {
            _httpContextAccessor = httpContextAccessor;
            _bus = bus;
            var database = mongoClient.GetDatabase(twitterCloneDbConfig.Value.DatabaseName);
            _likeRetweetCollection = database.GetCollection<LikeRetweets>(twitterCloneDbConfig.Value.LikeRetweetCollectionName);
            _commentCollection = database.GetCollection<Comments>(twitterCloneDbConfig.Value.CommentCollectionName);
            _user = database.GetCollection<User>(twitterCloneDbConfig.Value.UserCollectionName);
            _tweetCollection = database.GetCollection<Tweets>(twitterCloneDbConfig.Value.TweetCollectionName);
        }

        public async Task<CommentResponseDto?> Comment(string id, string comment)
        {
            CommentResponseDto? commentResponseDto = null;
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                Tweets? tweet = await _tweetCollection.Find(x => x.Id == id).FirstOrDefaultAsync();
                if (userId != null && tweet != null)
                {
                    Comments commentObj = new Comments
                    {
                        TweetId = id,
                        Comment = comment,
                        UserId = userId,
                        CreatedAt = DateTime.Now
                    };
                    await _commentCollection.InsertOneAsync(commentObj);
                    tweet.CommentCount += 1;
                    await _tweetCollection.ReplaceOneAsync(x => x.Id == id, tweet);


                    NotificationCreateDto notificationCreateDto = new NotificationCreateDto
                    {
                        UserId = tweet.UserId,
                        RefUserId = userId,
                        TweetId = tweet.Id,
                        Type = "Comment",
                    };
                    await _bus.Publish(notificationCreateDto);

                    return commentObj.AsDto();
                }


            }
            return commentResponseDto;
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
        public async Task<bool> DeleteComment(string commentId)
        {
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId != null)
                {
                    Comments commentRes = await _commentCollection.Find(x => x.Id == commentId && x.UserId == userId).FirstOrDefaultAsync();
                    if (commentRes != null)
                    {
                        Tweets? tweet = await _tweetCollection.Find(x => x.Id == commentRes.TweetId).FirstOrDefaultAsync();
                        if (tweet != null)
                        {
                            tweet.CommentCount -= 1;
                            await _tweetCollection.ReplaceOneAsync(x => x.Id == commentRes.TweetId, tweet);

                            await _commentCollection.DeleteOneAsync(x => x.Id == commentId);
                            return true;
                        }
                    }
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
                    User user = await _user.Find(x => x.Id == comment.UserId).FirstOrDefaultAsync();
                    comment.User = user.AsDtoTweetComment();
                }
            }
            return commentResponse;
        }

        public async Task<string> LikeTweet(string id)
        {
            string msg = "Something went wrong";
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                Tweets? tweet = await _tweetCollection.Find(x => x.Id == id).FirstOrDefaultAsync();
                if (userId != null && tweet != null)
                {
                    var likeRetweet = await _likeRetweetCollection.Find(x => x.UserId == userId && x.TweetId == id).FirstOrDefaultAsync();
                    if (likeRetweet == null)
                    {
                        likeRetweet = new LikeRetweets
                        {
                            UserId = userId,
                            TweetId = id,
                            IsLiked = true,
                            IsRetweeted = false,
                        };
                        await _likeRetweetCollection.InsertOneAsync(likeRetweet);
                        tweet.LikeCount += 1;
                        await _tweetCollection.ReplaceOneAsync(x => x.Id == id, tweet);
                        msg = "Tweet liked";


                        NotificationCreateDto notificationCreateDto = new NotificationCreateDto
                        {
                            UserId = tweet.UserId,
                            RefUserId = userId,
                            TweetId = tweet.Id,
                            Type = "Like",
                        };
                        await _bus.Publish(notificationCreateDto);
                    }
                    else
                    {
                        if (likeRetweet.IsLiked)
                        {
                            await _likeRetweetCollection.DeleteOneAsync(x => x.Id == likeRetweet.Id);
                            tweet.LikeCount -= 1;
                            await _tweetCollection.ReplaceOneAsync(x => x.Id == id, tweet);
                            msg = "Tweet unliked";
                        }
                        else
                        {
                            likeRetweet.IsLiked = true;
                            await _likeRetweetCollection.ReplaceOneAsync(x => x.Id == likeRetweet.Id, likeRetweet);
                            tweet.LikeCount += 1;
                            await _tweetCollection.ReplaceOneAsync(x => x.Id == id, tweet);
                            msg = "Tweet liked";


                            NotificationCreateDto notificationCreateDto = new NotificationCreateDto
                            {
                                UserId = tweet.UserId,
                                RefUserId = userId,
                                TweetId = tweet.Id,
                                Type = "Like",
                            };
                            await _bus.Publish(notificationCreateDto);
                        }
                    }


                }
            }
            return msg;
        }



        public async Task<List<TweetCommentUserResponseDto>> GetLikedUsers(int max, int page, string tweetId)
        {
            string[] likedUsersId = (await _likeRetweetCollection.Find(x => x.TweetId == tweetId && x.IsLiked).Skip((page) * max).Limit(max).ToListAsync()).Select(f => f.UserId).ToArray();
            return (await _user.Find(u => likedUsersId.Contains(u.Id)).ToListAsync()).Select(u => u.AsDtoTweetComment()).ToList();
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