
namespace Core.Models;

public class JWTResponse
{
    public string JwtToken { get; set; } = string.Empty;
    public int JwtExpiresIn { get; set; }

}