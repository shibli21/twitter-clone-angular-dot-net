using FluentValidation;

namespace Core.Dtos
{
    public class ResetPasswordDto
    {
        public string Token { get; set; } = String.Empty;
        public string Password { get; set; } = String.Empty;
        public string ConfirmPassword { get; set; } = String.Empty;
    }
    public class ResetPasswordValidator : AbstractValidator<ResetPasswordDto>
    {
        public ResetPasswordValidator()
        {
            RuleFor(x => x.Token).NotEmpty();
            RuleFor(x => x.Password).NotEmpty().WithMessage("password is required")
                                                .Must(BeStrongPassword)
                                                .WithMessage("Password must contain at least one number, one uppercase and one lowercase letter");
            RuleFor(x => x.ConfirmPassword).NotEmpty().Equal(x => x.Password);
        }

        private bool BeStrongPassword(string password)
        {
            if (password.Any(char.IsDigit) && password.Any(char.IsUpper) && password.Any(char.IsLower)) return true;
            return false;
        }
    }
}