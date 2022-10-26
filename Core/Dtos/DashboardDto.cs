namespace Core.Dtos
{
    public class DashboardDto
    {
        public long TotalRetweets { get; set; } = 0;
        public long TotalTweets { get; set; } = 0;
        public long TotalUsers { get; set; } = 0;
        public long TotalBlockedUsers { get; set; } = 0;
        public long TodaysTweets { get; set; } = 0;
        public long TodaysRetweets { get; set; } = 0;
        public long TodaysUsers { get; set; } = 0;
        public long TodaysBlockedUsers { get; set; } = 0;
    }
}