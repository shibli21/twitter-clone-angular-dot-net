

using MongoDB.Bson.Serialization.Attributes;

namespace learnathon_learning_phase.Models
{
    public class UserResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string DateOfBirth { get; set; } = string.Empty;




    }
}