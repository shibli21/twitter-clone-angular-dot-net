using System.Security.Claims;
using learnathon_learning_phase.Dtos;
using learnathon_learning_phase.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace learnathon_learning_phase.Services
{
    public class FollowService : IFollowerService
    {
        private readonly IMongoCollection<FollowModel> _followCollection;

        private readonly IHttpContextAccessor _httpContextAccessor;
        public FollowService(IOptions<NoobMastersDatabaseSettings> noobCloneDatabaseSettings, IMongoClient mongoClient,  IHttpContextAccessor httpContextAccessor)
        {
            
            var mongoDatabase = mongoClient.GetDatabase(noobCloneDatabaseSettings.Value.DatabaseName);

            _followCollection = mongoDatabase.GetCollection<FollowModel>(noobCloneDatabaseSettings.Value.FollowerCollectionName);

            _httpContextAccessor = httpContextAccessor;
        }
        
        public async Task FollowByUserId( string followingId)
        {
            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if(userId != null)
                {
                    FollowModel user = await _followCollection.Find(follow => follow.UserId == userId).FirstOrDefaultAsync();
                    if (user == null)
                    {
                        user = new FollowModel
                        {
                            UserId = userId,
                            Following = new string[] {followingId},

                        };
                        await _followCollection.InsertOneAsync(user);
                    }
                    else if (! user.Following.Contains(followingId))
                    {
                        user.Following = user.Following.Append(followingId).ToArray();
                        await _followCollection.ReplaceOneAsync(follow => follow.UserId == userId, user);
                    }

                    FollowModel followingUser = await _followCollection.Find(follow => follow.UserId == followingId).FirstOrDefaultAsync();
                    if (followingUser == null)
                    {
                        followingUser = new FollowModel
                        {
                            UserId = followingId,
                            FollowedBy = new string[] {userId},

                        };
                        await _followCollection.InsertOneAsync(followingUser);
                    }
                    else if (! followingUser.FollowedBy.Contains(userId))
                    {
                        followingUser.FollowedBy = followingUser.FollowedBy.Append(userId).ToArray();
                        await _followCollection.ReplaceOneAsync(follow => follow.UserId == followingId, followingUser);
                    }

                }
            }
            

        }

        public Task<List<FollowModel>> GetFollowers()
        {
            throw new NotImplementedException();
        }

        public Task<List<FollowModel>> GetFollowing()
        {
            throw new NotImplementedException();
        }

        public async Task UnFollowByUserId(string followingId)
        {


            if (_httpContextAccessor.HttpContext != null)
            {
                string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if(userId != null)
                {
                    FollowModel user = await _followCollection.Find(follow => follow.UserId == userId).FirstOrDefaultAsync();
                    if (user != null)
                    {
                        user.Following = user.Following.Where(following => following != followingId).ToArray();
                        await _followCollection.ReplaceOneAsync(follow => follow.UserId == userId, user);
                    }
                    FollowModel followingUser = await _followCollection.Find(follow => follow.UserId == followingId).FirstOrDefaultAsync();
                    if (followingUser != null)
                    {
                        followingUser.FollowedBy = followingUser.FollowedBy.Where(followedBy => followedBy != userId).ToArray();
                        await _followCollection.ReplaceOneAsync(follow => follow.UserId == followingId, followingUser);
                    }
                }
            }
        }
    }
}