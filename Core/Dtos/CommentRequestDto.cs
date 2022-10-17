using System.ComponentModel.DataAnnotations;

namespace Core.Dtos
{
    public class CommentRequestDto
    {
        [Required]
        public string Comment { get; set; } = String.Empty;
    }
}