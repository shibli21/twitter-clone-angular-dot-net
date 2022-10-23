using Core.Dtos;
using Core.Models;
using Infrastructure.Config;
using NotificationService.Hubs;
using MassTransit;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Microsoft.AspNetCore.SignalR;

namespace NotificationService.Consumers
{
    public class NotificationConsumer : IConsumer<NotificationCreateDto>
    {

        private readonly IMongoCollection<Notifications> _notificationCollection;
        private readonly IHubContext<NotificationHub> _notificationHub;
        private readonly IMongoCollection<SignalrConnections> _connectionsCollection;
        private readonly IMongoCollection<User> _usersCollection;
        public NotificationConsumer(IOptions<TwitterCloneDbConfig> twitterCloneDbConfig, IMongoClient mongoClient, IHubContext<NotificationHub> notificationHub)
        {
            var mongoDatabase = mongoClient.GetDatabase(twitterCloneDbConfig.Value.DatabaseName);
            _notificationCollection = mongoDatabase.GetCollection<Notifications>(twitterCloneDbConfig.Value.NotificationCollectionName);
            _notificationHub = notificationHub;
            _connectionsCollection = mongoDatabase.GetCollection<SignalrConnections>(twitterCloneDbConfig.Value.SignalrConnectionCollectionName);
            _usersCollection = mongoDatabase.GetCollection<User>(twitterCloneDbConfig.Value.UserCollectionName);
        }

        public async Task Consume(ConsumeContext<NotificationCreateDto> context)
        {
            NotificationCreateDto notificationCreateDto = context.Message;
            if (notificationCreateDto.UserId != notificationCreateDto.RefUserId)
            {
                var notification = new Notifications
                {
                    Type = notificationCreateDto.Type,
                    UserId = notificationCreateDto.UserId,
                    RefUserId = notificationCreateDto.RefUserId,
                    TweetId = notificationCreateDto.TweetId,
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };
                await _notificationCollection.InsertOneAsync(notification);

                var connectionIds = await _connectionsCollection.Find(x => x.UserId == notification.UserId).Project(x => x.ConnectionId).ToListAsync();
                NotificationResponseDto notificationResponse = notification.AsDto();
                notificationResponse.RefUser = await _usersCollection.Find(x => x.Id == notification.RefUserId).Project(x => x.AsDto()).FirstOrDefaultAsync();
                await _notificationHub.Clients.Clients(connectionIds).SendAsync("ReceiveNotification", notificationResponse);
            }

        }
    }
}