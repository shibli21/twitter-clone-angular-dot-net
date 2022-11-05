using Core.Dtos;
using Core.Models;

namespace Core.Interfaces;

public interface IUsersService
{
    Task<User?> GetUserAsync(string id);
    Task<PaginatedUserResponseDto> GetPaginatedUsers(int size, int page);
    Task<PaginatedUserResponseDto> GetPaginatedAdmins(int size, int page);
    Task<List<UserResponseDto>> MayFollowUser(int size);
    Task<List<UserResponseDto>> FollowAuthor(string userId);
    Task<User> UpdateGetUserAsync(string id, User user);
    Task<User?> GetUserByNameAsync(string name);
    Task<User?> GetUserByEmailAsync(string email);
    Task<User> CreateUserAsync(User user);
    Task<long> GetFollowerCount(string id);
    Task<long> GetFollowingCount(string id);
    Task<UserResponseDto?> GetAuthUser();
}
