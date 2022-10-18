using Core.Dtos;
using Core.Interfaces;
using Core.Models;
using FluentValidation;

namespace UserService.Validators;

public class UserValidator : AbstractValidator<UserRequestDto>
{
    private readonly IUsersService _userService;

    public UserValidator(IUsersService userService)
    {
        _userService = userService;

        RuleFor(u => u.UserName).NotEmpty()
            .MinimumLength(4)
            .WithMessage("Username must be at least 4 characters long")
            .Must(UniqueName)
            .WithMessage("Username is already taken");

        RuleFor(u => u.Email).NotEmpty()
            .EmailAddress()
            .WithMessage("Email is not valid")
            .Must(UniqueEmail)
            .WithMessage("Email is already taken");

        RuleFor(u => u.FirstName).NotEmpty();

        RuleFor(u => u.LastName).NotEmpty();

        RuleFor(u => u.Password).NotEmpty()
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters long")
            .Must(BeStrongPassword)
            .WithMessage("Password must contain at least one number, one uppercase and one lowercase letter");

        RuleFor(u => u.ConfirmPassword).NotEmpty()
            .Must((user, confirmPassword) => user.Password == confirmPassword)
            .WithMessage("Passwords do not match");

        RuleFor(u => u.Gender).NotNull().NotEmpty();
        RuleFor(u => u.DateOfBirth).NotNull().NotEmpty();
    }
    private bool UniqueName(string name)
    {
        Task<User?> user = _userService.GetUserByNameAsync(name);
        if (user.Result == null) return true;
        return false;
    }

    private bool UniqueEmail(string email)
    {
        Task<User?> user = _userService.GetUserByEmailAsync(email);
        if (user.Result == null) return true;
        return false;
    }


    private bool BeStrongPassword(string password)
    {
        if (password.Any(char.IsDigit) && password.Any(char.IsUpper) && password.Any(char.IsLower)) return true;
        return false;
    }
}
