

using FluentValidation;

namespace Core.Dtos;

public class PasswordChangeDto
{
    public string OldPassword { get; set; } = String.Empty;
    public string NewPassword { get; set; } = String.Empty;
    public string ConfirmPassword { get; set; } = String.Empty;
}

public class PasswordChangeValidator : AbstractValidator<PasswordChangeDto>
{
    public PasswordChangeValidator()
    {
        RuleFor(x => x.OldPassword).NotEmpty().WithMessage("Old password is required");
        RuleFor(x => x.NewPassword).NotEmpty().WithMessage("New password is required")
                                            .Must(BeStrongPassword)
                                            .WithMessage("Password must contain at least one number, one uppercase and one lowercase letter");

        RuleFor(x => x.ConfirmPassword).NotEmpty().WithMessage("Confirm password is required");
        RuleFor(x => x.ConfirmPassword).Equal(x => x.NewPassword).WithMessage("Passwords do not match");
    }

    private bool BeStrongPassword(string password)
    {
        if (password.Any(char.IsDigit) && password.Any(char.IsUpper) && password.Any(char.IsLower)) return true;
        return false;
    }
}