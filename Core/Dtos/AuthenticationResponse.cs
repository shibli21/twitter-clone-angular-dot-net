namespace Core.Dtos;

public class AuthenticationResponse
{
    public string UserName { get; set; } = string.Empty;
    public string JwtToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public int JwtExpiresIn { get; set; }
    public int RefreshTokenExpiresIn { get; set; }
}
