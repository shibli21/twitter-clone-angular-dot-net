using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Core.Interfaces;
using Core.Models;
using Infrastructure.Config;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services;

public class PhotoService : IPhotoService
{
    public IConfiguration Configuration { get; }
    public CloudinarySettings _cloudinarySettings;

    private readonly Cloudinary _cloudinary;
    public PhotoService(IConfiguration configuration)
    {
        Configuration = configuration;
        _cloudinarySettings = Configuration.GetSection("CloudinarySettings").Get<CloudinarySettings>();
        Account account = new(_cloudinarySettings.CloudName, _cloudinarySettings.ApiKey, _cloudinarySettings.ApiSecret);
        _cloudinary = new Cloudinary(account);
    }


    public async Task<PhotoUploadResult> AddPhotoAsync(IFormFile file, int width = 500, int height = 500)
    {
        var uploadResult = new ImageUploadResult();
        if (file.Length > 0)
        {
            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Transformation = new Transformation().Width(width).Height(height).Crop("lfill").Gravity("face")
            };
            uploadResult = await _cloudinary.UploadAsync(uploadParams);
        }
        if (uploadResult.Error != null)
        {
            throw new Exception(uploadResult.Error.Message);
        }
        return new PhotoUploadResult
        {
            PublicId = uploadResult.PublicId,
            Url = uploadResult.SecureUrl.AbsoluteUri
        };
    }


}

