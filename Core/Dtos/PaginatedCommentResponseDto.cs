namespace Core.Dtos
{
    public class PaginatedCommentResponseDto
    {
        public int Page { get; set; } = 0;
        public int Size { get; set; } = 20;
        public long TotalElements { get; set; } = 0;
        public int LastPage { get; set; } = 0;
        public int TotalPages { get; set; } = 0;
        public List<CommentResponseDto>? Comments { get; set; }
    }

}