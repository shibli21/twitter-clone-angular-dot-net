using System.ComponentModel.DataAnnotations;
using learnathon_learning_phase.Models;
using learnathon_learning_phase.Services;
using learnathon_learning_phase.Dtos;

namespace learnathon_learning_phase.Validators
{
    public class UsernameUniqueValidationAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var user = validationContext.ObjectInstance as UserRegistrationDto;
            var username = user?.Username;


            var userService = validationContext.GetService(typeof(IUserService)) as IUserService;

            Task<UserModel> chUser = userService!.GetUserByUsername(username!);
            if (chUser.Result != null)
            {
                return new ValidationResult("Username already taken");
            }
            return ValidationResult.Success;
        }
    }
}
