using Core.Dtos;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace NotificationService.Controllers;

[ApiController]
[Route("notifications")]
public class NotificationService : ControllerBase
{
    private readonly INotificationsService _notificationService;
    public NotificationService(INotificationsService notificationService)
    {
        _notificationService = notificationService;
    }


    [HttpGet("all"), Authorize]
    public async Task<ActionResult<PaginatedNotificationResponseDto>> GetNotifications([FromQuery] int size = 20, [FromQuery] int page = 0)
    {
        return Ok(await _notificationService.GetNotifications(page, size));
    }

    [HttpPut("{id}"), Authorize]
    public async Task<ActionResult<object>> MarkNotificationAsRead(string id)
    {
        string res = await _notificationService.MarkNotificationAsRead(id);
        if (res == "Notification not found")
        {
            return NotFound(new { message = res });
        }
        return Ok(new { message = res });
    }

}
