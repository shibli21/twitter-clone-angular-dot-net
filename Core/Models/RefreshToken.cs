using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Core.Models;
public class RefreshToken
{

    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = String.Empty;

    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("token")]
    public string Token { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime Created { get; set; } = DateTime.Now;

    [BsonElement("expires")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
    public DateTime Expires { get; set; }

}
