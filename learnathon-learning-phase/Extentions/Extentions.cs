using learnathon_learning_phase.Models;

namespace learnathon_learning_phase.Extentions
{
    public static class Extensions
    {
        public static UserResponseDto AsDto(this UserModel user)
        {
            return new UserResponseDto
            {
                Username = user.Username,
                Email = user.Email,
                DateOfBirth = user.DateOfBirth,
                Id = user.Id
            };
        }
    }
}