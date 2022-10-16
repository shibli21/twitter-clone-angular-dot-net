using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Core.Dtos;
using Core.Models;
using Microsoft.IdentityModel.Tokens;

namespace JWTAuthenticationManager
{
    public class JwtTokenHandler
    {
        public const string JWT_SECRET_KEY = "This is my custom Secret key for authnetication";
        public const int JWT_TOKEN_VALIDITY_MINS = 20;

        public JWTResponse GenerateJwtToken(User user)
        {
            var tokenExpiryTimeStamp = DateTime.Now.AddMinutes(JWT_TOKEN_VALIDITY_MINS);
            var tokenKey = Encoding.ASCII.GetBytes(JWT_SECRET_KEY);
            var claimsIdentity = new ClaimsIdentity(
                new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier,user.Id),
                    new Claim(ClaimTypes.Role, user.Role)
                }
            );

            var signingCredentials = new SigningCredentials(new SymmetricSecurityKey(tokenKey), SecurityAlgorithms.HmacSha256Signature);

            var securityTokensDescriptor = new SecurityTokenDescriptor
            {
                Subject = claimsIdentity,
                Expires = tokenExpiryTimeStamp,
                SigningCredentials = signingCredentials
            };

            var jwtTokenHandler = new JwtSecurityTokenHandler();
            var securityToken = jwtTokenHandler.CreateToken(securityTokensDescriptor);
            var token = jwtTokenHandler.WriteToken(securityToken);
            return new JWTResponse
            {
                JwtToken = token,
                JwtExpiresIn = (int)tokenExpiryTimeStamp.Subtract(DateTime.Now).TotalSeconds,
            };
        }
    }
}
