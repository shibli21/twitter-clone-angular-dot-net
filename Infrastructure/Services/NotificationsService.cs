using System.Security.Claims;
using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Config;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Infrastructure.Services
{
    public class NotificationsService : INotificationsService
    {

        private readonly IMongoCollection<User> _user;

        private readonly IMongoCollection<Notifications> _notificationCollection;

        private readonly IHttpContextAccessor _httpContextAccessor;
        public NotificationsService(IOptions<TwitterCloneDbConfig> twitterCloneDbConfig, IMongoClient mongoClient, IHttpContextAccessor httpContextAccessor)
        {
            var mongoDatabase = mongoClient.GetDatabase(twitterCloneDbConfig.Value.DatabaseName);
            _user = mongoDatabase.GetCollection<User>(twitterCloneDbConfig.Value.UserCollectionName);
            _notificationCollection = mongoDatabase.GetCollection<Notifications>(twitterCloneDbConfig.Value.NotificationCollectionName);
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task CreateNotification(NotificationCreateDto notificationCreateDto)
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
        }

        public async Task<PaginatedNotificationResponseDto> GetNotifications(int page, int size)
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var filter = _notificationCollection.Find(x => x.UserId == userId);
            long TotalElements = await filter.CountDocumentsAsync();
            int LastPage = (int)Math.Ceiling((double)TotalElements / size) - 1;
            LastPage = LastPage < 0 ? 0 : LastPage;
            PaginatedNotificationResponseDto notificationRes = new PaginatedNotificationResponseDto()
            {
                TotalElements = TotalElements,
                Page = page,
                Size = size,
                LastPage = LastPage,
                TotalPages = (int)Math.Ceiling((double)TotalElements / size),
                TotalUnread = await _notificationCollection.Find(x => x.UserId == userId && x.IsRead == false).CountDocumentsAsync(),
                Notifications = (await filter.SortByDescending(x => x.CreatedAt).Skip((page) * size).Limit(size).ToListAsync()).Select(notification => notification.AsDto()).ToList()
            };
            foreach (var notification in notificationRes.Notifications)
            {
                var user = await _user.Find(x => x.Id == notification.RefUserId).FirstOrDefaultAsync();
                notification.RefUser = user.AsDto();
                notification.Message = notification.Type switch
                {
                    "Like" => $"{notification.RefUser?.FirstName} {notification.RefUser?.LastName} liked your tweet",
                    "Retweet" => $"{notification.RefUser?.FirstName} {notification.RefUser?.LastName} retweeted your tweet",
                    "Follow" => $"{notification.RefUser?.FirstName} {notification.RefUser?.LastName} started following you",
                    "Comment" => $"{notification.RefUser?.FirstName} {notification.RefUser?.LastName} commented on your tweet",
                    _ => "Unknown"
                };
            }
            return notificationRes;
        }

        public async Task<string> MarkNotificationAsRead(string id)
        {

            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            Notifications? notification = await _notificationCollection.Find(x => x.Id == id && x.UserId == userId).FirstOrDefaultAsync();
            if (notification != null)
            {
                notification.IsRead = true;
                await _notificationCollection.ReplaceOneAsync(x => x.Id == id, notification);
                return "Notification marked as read";
            }
            else
            {
                return "Notification not found";
            }
        }
    }
}