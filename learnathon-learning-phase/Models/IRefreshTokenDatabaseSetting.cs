namespace learnathon_learning_phase.Models
{
    public interface IRefreshTokenDatabaseSetting
    {
        string RefreshTokenCollectionName { get; set; }
        string ConnectionString { get; set; }
        string DatabaseName { get; set; }
    }
}
