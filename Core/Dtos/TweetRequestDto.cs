
using System.ComponentModel.DataAnnotations;

namespace Core.Dtos;

public class TweetRequestDto
{

    [Required]
    public string Tweet { get; set; } = String.Empty;

    public string[] HashTags { get; set; } = new string[0];

}
