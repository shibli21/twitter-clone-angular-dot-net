using System.Reflection;
using Core.Interfaces;
using FluentValidation;
using FluentValidation.AspNetCore;
using Infrastructure.Config;
using Infrastructure.Services;
using JWTAuthenticationManager;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using Serilog;
using Swashbuckle.AspNetCore.Filters;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, lc) => lc.WriteTo.Console());

builder.Services.Configure<TwitterCloneDbConfig>(
    builder.Configuration.GetSection("TwitterCloneDatabaseSettings")
);

builder.Services.AddSingleton<IMongoClient>(sp =>
    new MongoClient(builder.Configuration.GetValue<string>("TwitterCloneDatabaseSettings:ConnectionString")));

builder.Services.AddSingleton<IUsersService, UsersService>();
builder.Services.AddSingleton<IRefreshTokenService, RefreshTokenService>();

builder.Services.AddControllers();

builder.Services.AddFluentValidationAutoValidation().AddFluentValidationClientsideAdapters();

builder.Services.AddValidatorsFromAssemblies(new[] { Assembly.GetExecutingAssembly() });

builder.Services.AddSingleton<JwtTokenHandler>();
builder.Services.AddCustomJwtAuthentication();

builder.Services.AddHttpContextAccessor();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
    {
        Description = "Standard Authorization header using the Bearer scheme. Example: \"bearer {token}\"",
        In = ParameterLocation.Header,
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });
    options.OperationFilter<SecurityRequirementsOperationFilter>();
});


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
