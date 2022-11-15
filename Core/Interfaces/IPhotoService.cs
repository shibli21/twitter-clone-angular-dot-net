using Core.Models;
using Microsoft.AspNetCore.Http;

namespace Core.Interfaces;
public interface IPhotoService
{
    Task<PhotoUploadResult> AddPhotoAsync(IFormFile file, int width = 500, int height = 500);
}