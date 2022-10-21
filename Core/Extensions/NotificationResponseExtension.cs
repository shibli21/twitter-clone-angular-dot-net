using Core.Dtos;
using Core.Models;

public static class NotificationResponseExtension
{
    public static NotificationResponseDto AsDto(this Notifications notification)
    {
        return new NotificationResponseDto
        {
            Id = notification.Id,
            Type = notification.Type,
            UserId = notification.UserId,
            RefUserId = notification.RefUserId,
            TweetId = notification.TweetId,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
        };
    }

}
