using System.Reflection;
using Core.Extensions;
using Core.Interfaces;
using FluentValidation;
using FluentValidation.AspNetCore;
using Infrastructure.Config;
using Infrastructure.Services;
using JWTAuthenticationManager;
using MongoDB.Driver;
using Serilog;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, lc) => lc.WriteTo.Console());

builder.Services.Configure<TwitterCloneDbConfig>(
    builder.Configuration.GetSection("TwitterCloneDatabaseSettings")
);
builder.Services.Configure<TwitterCloneRedisConfig>(
    builder.Configuration.GetSection("RedisSettings")
);

builder.Services.Configure<TwitterCloneSmtpConfig>(
    builder.Configuration.GetSection("EmailSettings")
);

builder.Services.AddSingleton<IMongoClient>(sp =>
    new MongoClient(builder.Configuration.GetValue<string>("TwitterCloneDatabaseSettings:ConnectionString")));

builder.Services.AddSingleton<IConnectionMultiplexer>(x => ConnectionMultiplexer.Connect(builder.Configuration.GetValue<string>("RedisSettings:Host") + ",password=" + builder.Configuration.GetValue<string>("RedisSettings:Password")));

builder.Services.AddSingleton<IUsersService, UsersService>();
builder.Services.AddSingleton<IRefreshTokenService, RefreshTokenService>();
builder.Services.AddSingleton<IFollowerService, FollowService>();
builder.Services.AddSingleton<IBlockService, BlockService>();
builder.Services.AddSingleton<IForgotPasswordService, ForgotPasswordService>();

builder.Services.AddControllers();

builder.Services.AddFluentValidationAutoValidation().AddFluentValidationClientsideAdapters();

builder.Services.AddValidatorsFromAssemblies(Assembly.GetExecutingAssembly()
    .GetReferencedAssemblies().Select(Assembly.Load).ToArray());

builder.Services.AddSingleton<JwtTokenHandler>();
builder.Services.AddCustomJwtAuthentication();

builder.Services.AddHttpContextAccessor();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerDocumentation();

var app = builder.Build();

app.UseSwaggerDocumentation();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
