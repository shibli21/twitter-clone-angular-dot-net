using System.ComponentModel.DataAnnotations;
using learnathon_learning_phase.Models;
using learnathon_learning_phase.Services;
using learnathon_learning_phase.Dtos;


namespace learnathon_learning_phase.Validators
{
    public class EmailEditUniqueValidationAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var user = validationContext.ObjectInstance as UserEditRequestDto;
            var email = user?.Email;
            var userService = validationContext.GetService(typeof(IUserService)) as IUserService;

            Task<UserModel> canEdit = userService!.GetUserById(user!.Id);

            Task<UserModel> chUser = userService.GetUserByEmail(email!);

            if (chUser.Result != null && canEdit.Result.Email != chUser.Result.Email)
            {
                return new ValidationResult("Email already taken");
            }
            return ValidationResult.Success;
        }
    }
}
