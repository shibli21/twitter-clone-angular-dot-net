
using System.Security.Claims;
using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace UserService.Controllers;

[ApiController]
[Route("[controller]")]
public class AdminController : ControllerBase
{

    private readonly IAdminService _adminService;
    private readonly IUsersService _usersService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    public AdminController(IAdminService adminService, IUsersService usersService, IHttpContextAccessor httpContextAccessor)
    {
        _adminService = adminService;
        _usersService = usersService;
        _httpContextAccessor = httpContextAccessor;
    }

    [HttpGet]
    [Route("dashboard")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<DashboardDto>> GetDashBoard()
    {
        var dashboard = await _adminService.GetDashboard();
        return Ok(dashboard);
    }


    [HttpGet, Authorize(Roles = "admin")]
    public async Task<ActionResult<PaginatedUserResponseDto>> GetAdmins([FromQuery] int page = 0, [FromQuery] int pageSize = 10)
    {
        var admins = await _usersService.GetPaginatedAdmins(pageSize, page);
        return Ok(admins);
    }

    [HttpPost("create/{userId}"), Authorize(Roles = "admin")]
    public async Task<ActionResult<object>> MakeUserAdmin(string userId)
    {
        var authUserId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (authUserId == null)
        {
            return Unauthorized();
        }
        if (authUserId == userId)
        {
            return BadRequest(new { message = "You can't change your own role" });
        }

        User? user = await _usersService.GetUserAsync(userId);
        if (user == null || user.DeletedAt != null || user.BlockedAt != null)
        {
            return NotFound();
        }
        string? msg;
        if (user.Role == "admin")
        {
            user.Role = "user";
            msg = "User is no longer admin";
        }
        else
        {
            user.Role = "admin";
            msg = "User is now admin";
        }
        user = await _usersService.UpdateGetUserAsync(user.Id, user);
        return Ok(new { Message = msg });
    }



}