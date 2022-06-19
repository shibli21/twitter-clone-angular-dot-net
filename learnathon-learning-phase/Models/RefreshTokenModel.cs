using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace learnathon_learning_phase.Models
{
    public class RefreshTokenModel
    {

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = String.Empty;

        [BsonElement("userId")]
        public string UserId { get; set; } = string.Empty;
        
        [BsonElement("token")]
        public string Token { get; set; } = string.Empty;

        [BsonElement("created")]
        public DateTime Created { get; set; } = DateTime.Now;

        [BsonElement("expires")]
        public DateTime Expires { get; set; }
        
    }
}
