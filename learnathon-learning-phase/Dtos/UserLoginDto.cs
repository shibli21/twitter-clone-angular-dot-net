using System.ComponentModel.DataAnnotations;

namespace learnathon_learning_phase.Dtos
{
    public class UserLoginDto
    {

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string Password { get; set; } = string.Empty;


    }
}
