namespace learnathon_learning_phase.Models
{
    public interface IUserDatabaseSetting
    {
        string UserCollectionName { get; set; }
        string ConnectionString { get; set; }
        string DatabaseName { get; set; }
    }
}
