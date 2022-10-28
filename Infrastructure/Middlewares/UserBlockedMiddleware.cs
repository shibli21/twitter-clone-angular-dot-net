using System.Globalization;
using System.Security.Claims;
using Core.Models;
using Infrastructure.Config;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Infrastructure.Middlewares
{
    public class UserBlockedMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IMongoCollection<User> _usersCollection;
        public UserBlockedMiddleware(RequestDelegate next,IOptions<TwitterCloneDbConfig> twitterCloneDatabaseSettings,
        IMongoClient mongoClient)
        {
            _next = next;
            var mongoDatabase = mongoClient.GetDatabase(twitterCloneDatabaseSettings.Value.DatabaseName);
            _usersCollection = mongoDatabase.GetCollection<User>(twitterCloneDatabaseSettings.Value.UserCollectionName);
        }
        public async Task InvokeAsync(HttpContext context)
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId != null)
            {
                var user = await _usersCollection.Find(user => user.Id == userId).FirstOrDefaultAsync();
                if (user == null )
                {
                    context.Response.StatusCode = 403;
                    await context.Response.WriteAsync("User not found");
                    return;
                }
                else if(user.BlockedAt != null)
                {
                    context.Response.StatusCode = 403;
                    await context.Response.WriteAsync("User is blocked");
                    return;
                }
                else if(user.DeletedAt != null)
                {
                    context.Response.StatusCode = 403;
                    await context.Response.WriteAsync("User is deleted");
                    return;
                }
            }
            await _next(context);
        }
    }
    public static class UserBlockedMiddlewareExtensions
    {
        public static IApplicationBuilder UseUserBlockedMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<UserBlockedMiddleware>();
        }
    }

}