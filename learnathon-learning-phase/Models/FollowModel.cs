using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace learnathon_learning_phase.Models
{
    public class FollowModel
    {
        
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = String.Empty;

        [BsonElement("userId")]
        public string UserId { get; set; } = string.Empty;
        
        [BsonElement("following_id")]
        public string FollowingId { get; set; } = string.Empty;

        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

    }
}