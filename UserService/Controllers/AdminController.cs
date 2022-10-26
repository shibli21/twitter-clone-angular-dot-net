
using Core.Dtos;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace UserService.Controllers;

[ApiController]
[Route("[controller]")]
public class AdminController : ControllerBase
{

    private readonly IAdminService _adminService;
    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet]
    [Route("dashboard")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<DashboardDto>> GetDashBoard()
    {
        var dashboard = await _adminService.GetDashboard();
        return Ok(dashboard);
    }


}