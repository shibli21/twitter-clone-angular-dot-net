using Core.Dtos;
using Core.Models;
using Infrastructure.Config;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace NotificationService.Hubs
{

    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IMongoCollection<SignalrConnections> _connectionsCollection;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public NotificationHub(IOptions<TwitterCloneDbConfig> twitterCloneDatabaseSettings,

        IMongoClient mongoClient, IHttpContextAccessor httpContextAccessor)
        {

            var mongoDatabase = mongoClient.GetDatabase(twitterCloneDatabaseSettings.Value.DatabaseName);
            _usersCollection = mongoDatabase.GetCollection<User>(twitterCloneDatabaseSettings.Value.UserCollectionName);
            _connectionsCollection = mongoDatabase.GetCollection<SignalrConnections>(twitterCloneDatabaseSettings.Value.SignalrConnectionCollectionName);
            _httpContextAccessor = httpContextAccessor;

        }

        public async Task SendNotification(Notifications notification)
        {
            var connectionIds = await _connectionsCollection.Find(x => x.UserId == notification.UserId).Project(x => x.ConnectionId).ToListAsync();
            NotificationResponseDto notificationResponse = notification.AsDto();
            notificationResponse.RefUser = await _usersCollection.Find(x => x.Id == notification.RefUserId).Project(x => x.AsDto()).FirstOrDefaultAsync();
            await Clients.Clients(connectionIds).SendAsync("ReceiveNotification", notificationResponse);
        }

        public override async Task OnConnectedAsync()
        {


            string? userId = Context?.GetHttpContext()?.Request.Query["userId"];


            if (userId != null)
            {
                var connection = new SignalrConnections
                {
                    ConnectionId = Context!.ConnectionId,
                    UserId = userId
                };
                await _connectionsCollection.InsertOneAsync(connection);
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await _connectionsCollection.DeleteOneAsync(x => x.ConnectionId == Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }



    }
}