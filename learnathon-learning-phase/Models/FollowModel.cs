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
        
        [BsonElement("following")]
        public string[] Following { get; set; } = new string[0];

        [BsonElement("followed_by")]
        public string[] FollowedBy { get; set; } = new string[0];

    }
}