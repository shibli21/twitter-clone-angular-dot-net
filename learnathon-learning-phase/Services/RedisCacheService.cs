using learnathon_learning_phase.Models;
using StackExchange.Redis;
using Newtonsoft.Json;

namespace learnathon_learning_phase.Services
{
    public class RedisCacheService : ICacheService
    {
        private readonly IConnectionMultiplexer _connectionMultiplexer;
        private readonly IDatabase _database;

        public RedisCacheService(IConnectionMultiplexer connectionMultiplexer)
        {
            _connectionMultiplexer = connectionMultiplexer;
            _database = _connectionMultiplexer.GetDatabase();

        }

        public async Task<List<UserResponseDto>> GetOnlineUsers()
        {
            RedisKey[] queueKeys =  _connectionMultiplexer.GetServer("redis-17016.c301.ap-south-1-1.ec2.cloud.redislabs.com:17016").Keys(pattern: "noobmasters_*").ToArray();
            RedisValue[] queueValues =await _connectionMultiplexer.GetDatabase().StringGetAsync(queueKeys);
            List<UserResponseDto> queues = queueValues.Select(qv => JsonConvert.DeserializeObject<UserResponseDto>(qv)).ToList();
            return queues;
        }

        public async Task SetUserOnline(UserResponseDto user)
        {
            
            string userString = JsonConvert.SerializeObject(user);
            await _database.StringSetAsync("noobmasters_" + user.Username, userString, TimeSpan.FromMinutes(1));
        }
    }
}
