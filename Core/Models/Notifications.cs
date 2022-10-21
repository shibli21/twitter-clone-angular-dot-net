using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Core.Models
{
    public class Notifications
    {

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = String.Empty;

        [BsonElement("type")]
        public string Type { get; set; } = String.Empty;

        [BsonElement("user_id")]
        public string UserId { get; set; } = String.Empty;

        [BsonElement("ref_user_id")]
        public string RefUserId { get; set; } = String.Empty;

        [BsonElement("tweet_id")]
        public string? TweetId { get; set; } = null;

        [BsonElement("is_read")]
        public bool IsRead { get; set; } = false;
    
        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}