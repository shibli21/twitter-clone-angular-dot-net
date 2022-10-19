using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Core.Models
{
    public class Tweets
    {

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = String.Empty;

        [BsonElement("type")]
        public string Type { get; set; } = "Tweet";

        [BsonElement("user_id")]
        public string UserId { get; set; } = String.Empty;

        [BsonElement("tweet")]
        public string Tweet { get; set; } = String.Empty;

        [BsonElement("comment_count")]
        public long CommentCount { get; set; } = 0;


        [BsonElement("like_count")]
        public long LikeCount { get; set; } = 0;

        [BsonElement("retweet_count")]
        public long RetweetCount { get; set; } = 0;

        [BsonElement("retweet_ref")]
        public string RetweetRefId { get; set; } = String.Empty;

        [BsonElement("history")]
        public string[] History { get; set; } = new string[0];

        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [BsonElement("updated_at")]
        public DateTime? UpdatedAt { get; set; } = null;

        [BsonElement("deleted_at")]
        public DateTime? DeletedAt { get; set; } = null;

    }
}