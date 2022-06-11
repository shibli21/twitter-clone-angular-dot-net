using System.ComponentModel.DataAnnotations;
using learnathon_learning_phase.Validators;

namespace learnathon_learning_phase.Models
{
    public class UserEditRequestDto
    {
        [Required]
        public string Id { get; set; } = string.Empty;


        [Required]
        [EmailAddress]
        [EmailEditUniqueValidation]
        public string Email { get; set; } = string.Empty;

        [Required]
        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        [AgeEditValidation]
        public string DateOfBirth { get; set; } = string.Empty;
    }
}