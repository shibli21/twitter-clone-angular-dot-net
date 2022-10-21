using Core.Models;

namespace Core.Dtos;


public class SearchedUserResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ProfilePictureUrl { get; set; } = string.Empty;
    public string CoverPictureUrl { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; } = DateTime.Now;
    public string Gender { get; set; } = string.Empty;
    public long Followers { get; set; } = 0;
    public long Following { get; set; } = 0;
    public string Address { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Role { get; set; } = Roles.User;
    public bool IsFollowed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}