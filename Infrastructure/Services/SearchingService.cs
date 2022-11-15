using System.Security.Claims;
using System.Text.RegularExpressions;
using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Config;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Infrastructure.Services
{
    public class SearchingService : ISearchingService
    {
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMongoCollection<Follows> _followCollection;
        private readonly IMongoCollection<Blocks> _blockCollection;
        private readonly IMongoCollection<HashTags> _hashTagCollection;
        private readonly IMongoCollection<Tweets> _tweetCollection;
        private readonly IMongoCollection<LikeRetweets> _likeRetweetCollection;
        private IHttpContextAccessor _httpContextAccessor;

        public SearchingService(IOptions<TwitterCloneDbConfig> twitterCloneDatabaseSettings,
        IMongoClient mongoClient, IHttpContextAccessor httpContextAccessor)
        {
            var mongoDatabase = mongoClient.GetDatabase(twitterCloneDatabaseSettings.Value.DatabaseName);
            _usersCollection = mongoDatabase.GetCollection<User>(twitterCloneDatabaseSettings.Value.UserCollectionName);
            _followCollection = mongoDatabase.GetCollection<Follows>(twitterCloneDatabaseSettings.Value.FollowerCollectionName);
            _blockCollection = mongoDatabase.GetCollection<Blocks>(twitterCloneDatabaseSettings.Value.BlockCollectionName);
            _hashTagCollection = mongoDatabase.GetCollection<HashTags>(twitterCloneDatabaseSettings.Value.HashTagCollectionName);
            _tweetCollection = mongoDatabase.GetCollection<Tweets>(twitterCloneDatabaseSettings.Value.TweetCollectionName);
            _likeRetweetCollection = mongoDatabase.GetCollection<LikeRetweets>(twitterCloneDatabaseSettings.Value.LikeRetweetCollectionName);
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<PaginatedTweetResponseDto> SearchTweetAsync(string searchQuery, int page, int limit)
        {
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId != null)
                {
                    var filter = _hashTagCollection.Find(x => x.HashTag.ToLower().Contains(searchQuery.ToLower())).SortByDescending(x => x.CreatedAt);
                    var totalElements = await filter.CountDocumentsAsync();
                    int LastPage = (int)Math.Ceiling((double)totalElements / limit) - 1;
                    LastPage = LastPage < 0 ? 0 : LastPage;
                    var tweetIds = (await filter.Skip((page) * limit)
                        .Limit(limit).ToListAsync()).Select(x => x.TweetId).Distinct().ToArray();

                    var blocked = await _blockCollection.Find(block => block.UserId == userId || block.BlockedUserId == userId).ToListAsync();
                    var blockedMeIds = blocked.Where(block => block.BlockedUserId == userId).Select(block => block.UserId).ToList();
                    var myBlockedIds = blocked.Where(block => block.UserId == userId).Select(block => block.BlockedUserId).ToList();
                    var blockedIds = blockedMeIds.Concat(myBlockedIds).ToList();

                    var tweets = await _tweetCollection.Find(tweet => tweetIds.Contains(tweet.Id) && tweet.DeletedAt == null && !blockedIds.Contains(tweet.UserId)).ToListAsync();

                    PaginatedTweetResponseDto resDto = new PaginatedTweetResponseDto()
                    {
                        TotalElements = totalElements,
                        Page = page,
                        Size = limit,
                        LastPage = LastPage,
                        TotalPages = LastPage + 1,
                        Tweets = tweets.Select(tweet => tweet.AsDto()).ToList()
                    };
                    if (resDto.Tweets != null)
                    {
                        foreach (TweetResponseDto tweet in resDto.Tweets)
                        {
                            User? userModel = await _usersCollection.Find(user => user.Id == tweet.UserId).FirstOrDefaultAsync();
                            if (userModel == null || userModel.DeletedAt != null || userModel.BlockedAt != null)
                            {
                                resDto.Tweets.Remove(tweet);
                                continue;
                            }
                            tweet.User = userModel.AsDtoTweetComment();
                            LikeRetweets likedOrRetweet = await _likeRetweetCollection.Find(x => x.UserId == userId && x.TweetId == tweet.Id).FirstOrDefaultAsync();
                            if (likedOrRetweet != null)
                            {
                                tweet.IsLiked = likedOrRetweet.IsLiked;
                                tweet.IsRetweeted = likedOrRetweet.IsRetweeted;
                            }
                            else
                            {
                                tweet.IsLiked = false;
                                tweet.IsRetweeted = false;
                            }
                            if (tweet.Type == "Retweet" && tweet.RetweetRefId != null)
                            {
                                Tweets? refTweet = await _tweetCollection.Find(x => x.Id == tweet.RetweetRefId).FirstOrDefaultAsync();
                                if (refTweet != null && refTweet.DeletedAt == null)
                                {
                                    User? refUser = await _usersCollection.Find(user => user.Id == refTweet.UserId).FirstOrDefaultAsync();
                                    if (refUser != null && refUser.DeletedAt == null && refUser.BlockedAt == null && !blockedIds.Contains(refUser.Id))
                                    {
                                        tweet.RefTweet = refTweet.AsDto();
                                        tweet.RefTweet.User = refUser.AsDtoTweetComment();
                                    }
                                }
                            }
                        }
                    }



                    return resDto;




                }
            }
            return new PaginatedTweetResponseDto();
        }

        public async Task<PaginatedSearchedUserResponseDto> SearchUsersAsync(string searchQuery, int page, int limit)
        {
            if (_httpContextAccessor.HttpContext != null)
            {
                string? id = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (id != null)
                {
                    var following = await _followCollection.Find(follow => follow.UserId == id).ToListAsync();
                    var followingIds = following.Select(follow => follow.FollowingId).ToList();
                    var blocked = await _blockCollection.Find(block => block.UserId == id || block.BlockedUserId == id).ToListAsync();
                    var blockedMeIds = blocked.Where(block => block.BlockedUserId == id).Select(block => block.UserId).ToList();
                    var myBlockedIds = blocked.Where(block => block.UserId == id).Select(block => block.BlockedUserId).ToList();
                    var blockedIds = blockedMeIds.Concat(myBlockedIds).ToList();

                    string[] searchQueryArray = searchQuery.ToLower().Trim().Split(" ");
                    string pattern = string.Join("|", searchQueryArray);

                    var searchFilter = Builders<User>.Filter.And(
                        Builders<User>.Filter.Eq(u => u.DeletedAt, null),
                        Builders<User>.Filter.Eq(u => u.BlockedAt, null),
                        Builders<User>.Filter.Ne(u => u.Id, id),
                        Builders<User>.Filter.Nin(u => u.Id, blockedIds),
                        Builders<User>.Filter.Or(
                            Builders<User>.Filter.Regex(u => u.UserName, $"/^{pattern}/i"),
                            Builders<User>.Filter.Regex(u => u.LastName, $"/^{pattern}/i"),
                            Builders<User>.Filter.Regex(u => u.FirstName, $"/^{pattern}/i")
                        ));

                    var findUsers = _usersCollection.Find(searchFilter);

                    long totalElements = await findUsers.CountDocumentsAsync();

                    int lastPage = (int)Math.Ceiling((double)totalElements / limit) - 1;
                    lastPage = lastPage < 0 ? 0 : lastPage;

                    int totalPages = lastPage + 1;
                    List<SearchedUserResponseDto> users = (await findUsers.Skip((page) * limit)
                        .Limit(limit)
                        .ToListAsync()).Select(user => user.AsDtoSearchedUser()).ToList();
                    foreach (SearchedUserResponseDto user in users)
                    {
                        if (followingIds.Contains(user.Id))
                        {
                            user.IsFollowed = true;
                        }
                    }
                    return new PaginatedSearchedUserResponseDto
                    {
                        TotalElements = totalElements,
                        Page = page,
                        Size = limit,
                        LastPage = lastPage,
                        TotalPages = totalPages,
                        Users = users
                    };

                }
            }
            return new PaginatedSearchedUserResponseDto();


        }
    }
}