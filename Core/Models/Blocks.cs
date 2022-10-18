using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Core.Models
{
    public class Blocks
    {
        
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = String.Empty;


        [BsonElement("user_id")]
        public string UserId { get; set; } = String.Empty;

        [BsonElement("blocked_user_id")]
        public string BlockedUserId { get; set; } = String.Empty;

        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
    }
}