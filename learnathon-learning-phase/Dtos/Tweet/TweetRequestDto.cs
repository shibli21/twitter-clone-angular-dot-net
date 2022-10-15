using System.ComponentModel.DataAnnotations;

namespace learnathon_learning_phase.Dtos.Tweet
{
    public class TweetRequestDto
    {

        [Required]
        public string Tweet { get; set; } = String.Empty;

        public string[] HashTags { get; set; } = new string[0];

    }
}