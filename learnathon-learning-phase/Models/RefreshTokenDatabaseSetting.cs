namespace learnathon_learning_phase.Models
{
    public class RefreshTokenDatabaseSetting : IRefreshTokenDatabaseSetting
    {
        public string RefreshTokenCollectionName { get; set; } = String.Empty;
        public string ConnectionString { get; set; } = String.Empty;
        public string DatabaseName { get; set; } = String.Empty;
    }
}
