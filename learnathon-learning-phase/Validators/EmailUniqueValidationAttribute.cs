using System.ComponentModel.DataAnnotations;
using learnathon_learning_phase.Models;
using learnathon_learning_phase.Dtos;
using learnathon_learning_phase.Interfaces;

namespace learnathon_learning_phase.Validators
{
    public class EmailUniqueValidationAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var user = validationContext.ObjectInstance as UserRegistrationDto;
            var email = user?.Email;
            var userService = validationContext.GetService(typeof(IUserService)) as IUserService;

            Task<UserModel> chUser = userService!.GetUserByEmail(email!);
            if (chUser.Result != null)
            {
                return new ValidationResult("Email already taken");
            }
            return ValidationResult.Success;
        }
    }
}
