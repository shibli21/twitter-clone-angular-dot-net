using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Core.Models
{
    public class LikeRetweets
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = String.Empty;

        [BsonElement("tweet_id")]
        public string TweetId { get; set; } = String.Empty;

        [BsonElement("user_id")]
        public string UserId { get; set; } = String.Empty;

        [BsonElement("is_liked")]
        public bool IsLiked { get; set; } = false;

        [BsonElement("is_retweeted")]
        public bool IsRetweeted { get; set; } = false;
        
    }
}