using FluentValidation;

namespace Core.Dtos
{
    public class ForgotPasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public string ResetPasswordUrl { get; set; } = string.Empty;

    }

    public class ForgetPasswordValidator : AbstractValidator<ForgotPasswordDto>
    {
        public ForgetPasswordValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.ResetPasswordUrl).NotEmpty();
        }
    }
}