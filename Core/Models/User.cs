using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace Core.Models;
public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("username")]
    public string UserName { get; set; } = string.Empty;

    [BsonElement("firstName")]
    public string FirstName { get; set; } = string.Empty;

    [BsonElement("lastName")]
    public string LastName { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("profilePictureUrl")]
    public string ProfilePictureUrl { get; set; } = string.Empty;

    [BsonElement("coverPictureUrl")]
    public string CoverPictureUrl { get; set; } = string.Empty;

    [BsonElement("dateOfBirth")]
    [DataType(DataType.Date)]
    public DateTime DateOfBirth { get; set; } = DateTime.Now;

    [BsonElement("gender")]
    public string Gender { get; set; } = string.Empty;

    [BsonElement("password")]
    public string Password { get; set; } = string.Empty;

    [BsonElement("role")]
    public string Role { get; set; } = Roles.User;

    [BsonElement("createdAt")]
    [DataType(DataType.Date)]
    public DateTime CreatedAt { get; set; } = DateTime.Now;


    [BsonElement("updatedAt")]
    [DataType(DataType.Date)]
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    [BsonElement("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [BsonElement("blocked_at")]
    public DateTime? BlockedAt { get; set; }
}
