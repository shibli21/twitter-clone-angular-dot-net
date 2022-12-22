namespace Core.Dtos
{
    public class PaginatedTagsResponseDto
    {
        
        public int Page { get; set; } = 0;
        public int Size { get; set; } = 20;
        public long TotalElements { get; set; }
        public int LastPage { get; set; } = 0;
        public int TotalPages { get; set; } = 0;
        public List<string>? HashTags { get; set; } = null;
    }
}