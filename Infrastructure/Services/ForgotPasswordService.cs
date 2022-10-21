using Core.Interfaces;
using Core.Models;
using StackExchange.Redis;
using Newtonsoft.Json;
using Microsoft.Extensions.Options;
using Infrastructure.Config;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace Infrastructure.Services
{
    public class ForgotPasswordService : IForgotPasswordService
    {
        private readonly IConnectionMultiplexer _connectionMultiplexer;
        private readonly IDatabase _database;
        private readonly TwitterCloneSmtpConfig _smtpConfig;
        private readonly TwitterCloneRedisConfig _redisConfig;

        public ForgotPasswordService(IOptions<TwitterCloneSmtpConfig> twitterCloneSmtpSettings, IOptions<TwitterCloneRedisConfig> twitterCloneRedisSettings, IConnectionMultiplexer connectionMultiplexer )
        {
            _connectionMultiplexer = connectionMultiplexer;
            _database = _connectionMultiplexer.GetDatabase();
            _smtpConfig = twitterCloneSmtpSettings.Value;
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

        public async Task SentResetPasswordEmailAsync(User user , string url, string token)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_smtpConfig.From));
            email.To.Add(MailboxAddress.Parse(user.Email));
            email.Subject = "Reset your password";
            email.Body = new TextPart("plain")
            {
                Text = $"Please click on the following link to reset your password: {url}?token={token}"
            };
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_smtpConfig.Host, _smtpConfig.Port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_smtpConfig.UserName, _smtpConfig.Password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }

        public async Task StoreResetPasswordTokenAsync(User user, string token)
        {
            string userString = JsonConvert.SerializeObject(user);
            await _database.StringSetAsync("noobmasters_token_" + token, userString, TimeSpan.FromMinutes(5));
        }
    }
}