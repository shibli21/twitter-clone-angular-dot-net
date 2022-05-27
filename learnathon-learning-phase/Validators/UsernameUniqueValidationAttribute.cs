using learnathon_learning_phase.Models;
using learnathon_learning_phase.Services;
using System.ComponentModel.DataAnnotations;

namespace learnathon_learning_phase.Validators
{
    public class UsernameUniqueValidationAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var user = validationContext.ObjectInstance as UserRegistrationDto;
            var email = user?.Email;
            var userService = (IUserService)validationContext.GetService(typeof(IUserService));

            UserModel chUser = userService.GetUserByEmail(email);
            if (chUser != null)
            {
                return new ValidationResult("Email already taken");
            }
            return ValidationResult.Success;
        }

    }
}
