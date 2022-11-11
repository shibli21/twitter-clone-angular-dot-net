using Core.Extensions;
using Core.Interfaces;
using Infrastructure.Config;
using Infrastructure.Middlewares;
using Infrastructure.Services;
using JWTAuthenticationManager;
using MassTransit;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCustomSerilog(builder.Environment);

builder.Services.Configure<TwitterCloneDbConfig>(
    builder.Configuration.GetSection("TwitterCloneDatabaseSettings")
);

builder.Services.AddSingleton<IMongoClient>(sp =>
    new MongoClient(builder.Configuration.GetValue<string>("TwitterCloneDatabaseSettings:ConnectionString")));

builder.Services.AddSingleton<ITweetService, TweetService>();
builder.Services.AddSingleton<ILikeCommentService, LikeCommentService>();
builder.Services.AddSingleton<IUsersService, UsersService>();
builder.Services.AddSingleton<IBlockService, BlockService>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSingleton<JwtTokenHandler>();
builder.Services.AddCustomJwtAuthentication();

builder.Services.AddHttpContextAccessor();

builder.Services.AddSwaggerDocumentation();


builder.Services.AddMassTransit(x =>
{
    x.AddBus(provider => Bus.Factory.CreateUsingRabbitMq(cfg =>
     {
         cfg.Host(builder.Configuration.GetValue<string>("RabbitMQSettings:Host"), h =>
         {
             h.Username(builder.Configuration.GetValue<string>("RabbitMQSettings:UserName"));
             h.Password(builder.Configuration.GetValue<string>("RabbitMQSettings:Password"));
         });
     }));
});




var app = builder.Build();

app.UseSwaggerDocumentation();

app.UseAuthentication();

app.UseAuthorization();

app.UseUserBlockedMiddleware();
app.MapControllers();

app.Run();
