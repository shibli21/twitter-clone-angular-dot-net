
using System.ComponentModel.DataAnnotations;
using learnathon_learning_phase.Models;

namespace learnathon_learning_phase.Validators
{
    public class AgeEditValidationAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var user = validationContext.ObjectInstance as UserEditRequestDto;
            DateTime dateOfBirth = DateTime.Parse(user!.DateOfBirth);
            int age = DateTime.Now.Year - dateOfBirth.Year;
            if (dateOfBirth > DateTime.Now.AddYears(-age))
                age--;
            if (age < 18)
                return new ValidationResult("Age must be greater than 18");
            return ValidationResult.Success;
        }
    }
}

