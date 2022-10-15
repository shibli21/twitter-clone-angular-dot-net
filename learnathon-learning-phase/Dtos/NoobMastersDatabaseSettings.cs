namespace learnathon_learning_phase.Dtos
{
    public class NoobMastersDatabaseSettings
    {
        public string ConnectionString { get; set; } = String.Empty;
        public string DatabaseName { get; set; } = String.Empty;
        public string UserCollectionName { get; set; } = String.Empty;
        public string RefreshTokenCollectionName { get; set; } = String.Empty;
        public string FollowerCollectionName { get; set; } = String.Empty;
        public string TweetCollectionName { get; set; } = String.Empty;
        public string HashTagCollectionName { get; set; } = String.Empty;
        public string LikeRetweetCollectionName { get; set; } = String.Empty;
        public string CommentCollectionName { get; set; } = String.Empty;
    }
}
