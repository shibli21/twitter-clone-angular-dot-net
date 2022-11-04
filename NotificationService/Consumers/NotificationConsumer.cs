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
    public class NotificationConsumer : IConsumer<CacheNotificationConsumerDto>
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

        public async Task Consume(ConsumeContext<CacheNotificationConsumerDto> context)
        {
            CacheNotificationConsumerDto cacheNotificationConsumerDto = context.Message;
            if (cacheNotificationConsumerDto.IsNotification == true && cacheNotificationConsumerDto.Notification != null)
            {
                NotificationCreateDto notificationCreateDto = cacheNotificationConsumerDto.Notification;
                if (notificationCreateDto.UserId != notificationCreateDto.RefUserId)
                {
                    Notifications? notification = null;
                    if(notificationCreateDto.Type == "Like" || notificationCreateDto.Type == "Comment")
                    {
                        notification = await _notificationCollection.Find(x => x.UserId == notificationCreateDto.UserId && x.RefUserId == notificationCreateDto.RefUserId && x.Type == notificationCreateDto.Type && x.TweetId == notificationCreateDto.TweetId).FirstOrDefaultAsync();
                    }

                    if(notification == null)
                    {
                        notification = new Notifications
                        {
                            UserId = notificationCreateDto.UserId,
                            RefUserId = notificationCreateDto.RefUserId,
                            Type = notificationCreateDto.Type,
                            TweetId = notificationCreateDto.TweetId,
                            IsRead = false,
                            CreatedAt = DateTime.Now
                        };
                        await _notificationCollection.InsertOneAsync(notification);
                    }
                    else
                    {
                        notification.IsRead = false;
                        notification.CreatedAt = DateTime.Now;
                        await _notificationCollection.ReplaceOneAsync(x => x.Id == notification.Id, notification);
                    }

                    var connectionIds = await _connectionsCollection.Find(x => x.UserId == notification.UserId).Project(x => x.ConnectionId).ToListAsync();
                    NotificationResponseDto notificationResponse = notification.AsDto();
                    notificationResponse.RefUser = await _usersCollection.Find(x => x.Id == notification.RefUserId).Project(x => x.AsDto()).FirstOrDefaultAsync();
                    notificationResponse.Message = notificationResponse.Type switch
                    {
                        "Like" => $"{notificationResponse.RefUser?.FirstName} {notificationResponse.RefUser?.LastName} liked your tweet",
                        "Retweet" => $"{notificationResponse.RefUser?.FirstName} {notificationResponse.RefUser?.LastName} retweeted your tweet",
                        "Follow" => $"{notificationResponse.RefUser?.FirstName} {notificationResponse.RefUser?.LastName} started following you",
                        "Comment" => $"{notificationResponse.RefUser?.FirstName} {notificationResponse.RefUser?.LastName} commented on your tweet",
                        _ => "Unknown"
                    };
                    await _notificationHub.Clients.Clients(connectionIds).SendAsync("ReceiveNotification", notificationResponse);
                }
            }


        }
    }
}