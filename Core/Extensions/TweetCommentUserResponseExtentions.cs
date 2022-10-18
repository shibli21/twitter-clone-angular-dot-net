using Core.Models;
using Core.Dtos;

public static class TweetCommentUserResponseExtensions
{
    public static TweetCommentUserResponseDto AsDtoTweetComment(this User user)
    {
        return new TweetCommentUserResponseDto
        {
            Id = user.Id,
            UserName = user.UserName,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePictureUrl = user.ProfilePictureUrl,
            CoverPictureUrl = user.CoverPictureUrl,
        };
    }


}