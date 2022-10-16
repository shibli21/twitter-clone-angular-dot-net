namespace learnathon_learning_phase.Models
{
    public class UserDatabaseSetting : IUserDatabaseSetting
    {
        public string UserCollectionName { get; set; } = String.Empty;
        public string ConnectionString { get; set; } = String.Empty;
        public string DatabaseName { get; set; } = String.Empty;
    }
}
