namespace learnathon_learning_phase.Dtos
{
    public class NoobMastersDatabaseSettings
    {
        public string ConnectionString { get; set; } = String.Empty;
        public string DatabaseName { get; set; } = String.Empty;
        public string UserCollectionName { get; set; } = String.Empty;
        public string RefreshTokenCollectionName { get; set; } = String.Empty;
        public string FollowerCollectionName { get; set; } = String.Empty;
    }
}
