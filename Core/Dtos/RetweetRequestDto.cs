

namespace Core.Dtos;

public class RetweetRequestDto
{

    public string Tweet { get; set; } = String.Empty;

    public string[] HashTags { get; set; } = new string[0];

}
