namespace learnathon_learning_phase.Models
{
    public class NoobMastersDatabaseSettings
    {
        public string ConnectionString { get; set; } = String.Empty;
        public string DatabaseName { get; set; } = String.Empty;
        public string UserCollectionName { get; set; } = String.Empty;
        public string RefreshTokenCollectionName { get; set; } = String.Empty;
    }
}
