using Core.Dtos;

namespace Core.Interfaces;

public interface INotificationsService
{
    Task CreateNotification(NotificationCreateDto notificationCreateDto);
    Task<string> MarkNotificationAsRead(string id);
    Task<PaginatedNotificationResponseDto> GetNotifications(int page, int size);
}
