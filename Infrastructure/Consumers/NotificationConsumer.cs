using Core.Dtos;
using Core.Models;
using Infrastructure.Config;
using MassTransit;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Infrastructure.Consumers
{
    public class NotificationConsumer : IConsumer<NotificationCreateDto>
    {

        private readonly IMongoCollection<Notifications> _notificationCollection;
        public NotificationConsumer(IOptions<TwitterCloneDbConfig> twitterCloneDbConfig, IMongoClient mongoClient)
        {
            var mongoDatabase = mongoClient.GetDatabase(twitterCloneDbConfig.Value.DatabaseName);
            _notificationCollection = mongoDatabase.GetCollection<Notifications>(twitterCloneDbConfig.Value.NotificationCollectionName);
        }

        public async Task Consume(ConsumeContext<NotificationCreateDto> context)
        {
            NotificationCreateDto notificationCreateDto = context.Message;

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
        }
    }
}