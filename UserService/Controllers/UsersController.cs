using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UserService.Controllers;

[ApiController]
[Route("[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUsersService _usersService;

    public UsersController(IUsersService usersService)
    {
        _usersService = usersService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponseDto?>> GetUserById(string id)
    {
        User? user = await _usersService.GetUserAsync(id);
        if (user == null)
        {
            return NotFound();
        }
        UserResponseDto userResponseDto = user.AsDto();
        userResponseDto.Followers = await _usersService.GetFollowerCount(id);
        userResponseDto.Following = await _usersService.GetFollowingCount(id);
        return Ok(userResponseDto);
    }

    [HttpPut("edit"), Authorize]
    public async Task<ActionResult<UserResponseDto?>> UpdateUser(UserEditDto userEditDto)
    {
        User? user = await _usersService.GetUserAsync(userEditDto.Id);
        if (user == null)
        {
            return NotFound();
        }
        user.UserName = userEditDto.UserName;
        user.Email = userEditDto.Email;
        user.FirstName = userEditDto.FirstName;
        user.LastName = userEditDto.LastName;
        user.ProfilePictureUrl = userEditDto.ProfilePictureUrl;
        user.CoverPictureUrl = userEditDto.CoverPictureUrl;
        user.Gender = userEditDto.Gender;
        user.DateOfBirth = userEditDto.DateOfBirth;
        user.UpdatedAt = DateTime.Now;
        user.Bio = userEditDto.Bio;
        user.Address = userEditDto.Address;

        await _usersService.UpdateGetUserAsync(user.Id, user);
        return Ok(user.AsDto());
    }


    [HttpGet("current-user"), Authorize]
    public async Task<ActionResult<UserResponseDto?>> GetCurrentUser()
    {
        UserResponseDto? user = await _usersService.GetAuthUser();
        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }
}
