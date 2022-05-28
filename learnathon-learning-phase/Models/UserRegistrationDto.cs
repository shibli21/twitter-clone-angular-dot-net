using System.ComponentModel.DataAnnotations;
using learnathon_learning_phase.Validators;
using Microsoft.AspNetCore.Mvc;

namespace learnathon_learning_phase.Models
{
    public class UserRegistrationDto
    {
        [Required]
        [UsernameUniqueValidation]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [EmailUniqueValidation]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Required]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        [AgeValidation]
        public string DateOfBirth { get; set; } = string.Empty;
    }
}
