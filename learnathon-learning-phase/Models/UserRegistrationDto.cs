using learnathon_learning_phase.Validators;
using System.ComponentModel.DataAnnotations;

namespace learnathon_learning_phase.Models
{
    public class UserRegistrationDto
    {
        [Required]
        [UsernameUniqueValidation]
        public string? Username { get; set; }

        [Required]
        [EmailAddress]
        [EmailUniqueValidation]
        public string? Email { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string? Password { get; set; }

        [Required]
        [Compare("Password")]
        public string? ConfirmPassword { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        [AgeValidation]
        public string? DateOfBirth { get; set; }
    }
}
