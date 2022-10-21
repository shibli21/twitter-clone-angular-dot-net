using Core.Dtos;

namespace Core.Interfaces
{
    public interface ISearchingService
    {
         Task<PaginatedSearchedUserResponseDto> SearchUsersAsync(string searchQuery, int page, int limit);
         Task<PaginatedTweetResponseDto> SearchTweetAsync(string searchQuery, int page, int limit);

    }
}