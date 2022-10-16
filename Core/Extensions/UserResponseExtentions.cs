using Core.Models;
using Core.Dtos;

public static class Extensions
{
    public static UserResponseDto AsDto(this User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            UserName = user.UserName,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            DateOfBirth = user.DateOfBirth,
            Gender = user.Gender,
            CreatedAt = user.CreatedAt,
        };
    }
}