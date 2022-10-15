using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace learnathon_learning_phase.Models
{
    public class CommentModel
    {
        
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = String.Empty;

        [BsonElement("tweet_id")]
        public string TweetId { get; set; } = String.Empty;

        [BsonElement("user_id")]
        public string UserId { get; set; } = String.Empty;

        [BsonElement("comment")]
        public string Comment { get; set; } = String.Empty;

        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [BsonElement("updated_at")]
        public DateTime? UpdatedAt { get; set; } = null;
        
    }
}