using System.ComponentModel.DataAnnotations;
using Core.Interfaces;
using Core.Models;
using FluentValidation;

namespace Core.Dtos;

public class UserEditDto
{
    public string Id { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ProfilePictureUrl { get; set; } = string.Empty;
    public string CoverPictureUrl { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;

    [DataType(DataType.Date)]
    public DateTime DateOfBirth { get; set; } = DateTime.Now;
}

public class UserEditValidator: AbstractValidator<UserEditDto>
{
     private readonly IUsersService _userService;
    public UserEditValidator(IUsersService userService)
    {
        _userService = userService;
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.UserName).NotEmpty()
            .MinimumLength(4)
            .WithMessage("Username must be at least 4 characters long")
            .Must(UniqueName)
            .WithMessage("Username is already taken");
        RuleFor(x => x.FirstName).NotEmpty();
        RuleFor(x => x.LastName).NotEmpty();
        RuleFor(x => x.Email).NotEmpty()
            .EmailAddress()
            .WithMessage("Email is not valid")
            .Must(UniqueEmail)
            .WithMessage("Email is already taken");
        RuleFor(x => x.Gender).NotEmpty();
        RuleFor(u => u.DateOfBirth).NotEmpty();
    }

    private bool UniqueName(UserEditDto userEditDto, string name)
    {
        Task<User?> user = _userService.GetUserByNameAsync(name);
        if (user.Result == null || user.Result.Id == userEditDto.Id) return true;
        return false;
    }

    private bool UniqueEmail(UserEditDto userEditDto,string email)
    {
        Task<User?> user = _userService.GetUserByEmailAsync(email);
        if (user.Result == null || user.Result.Id == userEditDto.Id) return true;
        return false;
    }

}
