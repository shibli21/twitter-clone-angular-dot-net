namespace Infrastructure.Config
{
    public class TwitterCloneSmtpConfig
    {
        public string Host { get; set; } = String.Empty;
        public int Port { get; set; }
        public string UserName { get; set; } = String.Empty;
        public string Password { get; set; } = String.Empty;
        public string From { get; set; } = String.Empty;
    }
}