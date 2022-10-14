public interface IUsersService
{
    Task<IEnumerable<User>> GetUsersAsync();
}
