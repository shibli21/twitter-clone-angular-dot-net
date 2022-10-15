namespace Infrastructure.Config;
public class TwitterCloneDbConfig
{
    public string ConnectionString { get; set; } = String.Empty;
    public string DatabaseName { get; set; } = String.Empty;
    public string UserCollectionName { get; set; } = String.Empty;
    public string RefreshTokenCollectionName { get; set; } = String.Empty;
}