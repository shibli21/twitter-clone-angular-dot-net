﻿
using learnathon_learning_phase.Models;
using System.ComponentModel.DataAnnotations;

namespace learnathon_learning_phase.Validators
{
    public class AgeValidationAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var user = validationContext.ObjectInstance as UserRegistrationDto;
            DateTime dateOfBirth = DateTime.Parse(user?.DateOfBirth);
            int age = DateTime.Now.Year - dateOfBirth.Year;
            if (dateOfBirth > DateTime.Now.AddYears(-age))
                age--;
            if (age < 18)
                return new ValidationResult("Age must be greater than 18");
            return ValidationResult.Success;
        }
    }
}
