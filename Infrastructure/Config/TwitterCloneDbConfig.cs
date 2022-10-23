namespace Infrastructure.Config;
public class TwitterCloneDbConfig
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
    public string BlockCollectionName { get; set; } = String.Empty;
    public string NotificationCollectionName { get; set; } = String.Empty;
    public string SignalrConnectionCollectionName { get; set; } = String.Empty;
}