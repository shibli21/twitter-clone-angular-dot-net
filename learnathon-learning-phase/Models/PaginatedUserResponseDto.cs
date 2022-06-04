namespace learnathon_learning_phase.Models
{
    public class PaginatedUserResponseDto
    {
        public int Page { get; set; }
        public int Size { get; set; }
        public long TotalElements { get; set; }
        public int LastPage { get; set; }
        public int TotalPages { get; set; }
        public List<UserResponseDto>? Users { get; set; }
    }

}