using Core.Interfaces;
using Core.Models;
using StackExchange.Redis;
using Newtonsoft.Json;
using Microsoft.Extensions.Options;
using Infrastructure.Config;
using Core.Dtos;

namespace Infrastructure.Services
{
    public class ForgotPasswordService : IForgotPasswordService
    {
        private readonly IConnectionMultiplexer _connectionMultiplexer;
        private readonly IDatabase _database;
        private readonly TwitterCloneRedisConfig _redisConfig;

        public ForgotPasswordService(IOptions<TwitterCloneRedisConfig> twitterCloneRedisSettings, IConnectionMultiplexer connectionMultiplexer )
        {
            _connectionMultiplexer = connectionMultiplexer;
            _database = _connectionMultiplexer.GetDatabase();
            _redisConfig = twitterCloneRedisSettings.Value;
        }

        public async Task DeleteResetPasswordTokenAsync(string token)
        {
            await _database.KeyDeleteAsync("noobmasters_token_" + token);

        }

        public async Task<User?> GetUserByResetTokenAsync(string token)
        {
            User? user = null;
            string? userJson = await _database.StringGetAsync("noobmasters_token_" + token);
            if (userJson != null)
            {
                user = JsonConvert.DeserializeObject<User>(userJson);
            }
            return user;
        }


        public async Task StoreResetPasswordTokenAsync(User user, string token)
        {
            string userString = JsonConvert.SerializeObject(user);
            await _database.StringSetAsync("noobmasters_token_" + token, userString, TimeSpan.FromMinutes(5));
        }
    }
}