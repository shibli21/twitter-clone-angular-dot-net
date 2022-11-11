
using CacheService.Consumers;
using Core.Extensions;
using Core.Interfaces;
using Infrastructure.Config;
using Infrastructure.Services;
using JWTAuthenticationManager;
using MassTransit;
using MongoDB.Driver;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddCustomSerilog(builder.Environment);

builder.Services.Configure<TwitterCloneDbConfig>(
    builder.Configuration.GetSection("TwitterCloneDatabaseSettings")
);

builder.Services.Configure<TwitterCloneRedisConfig>(
    builder.Configuration.GetSection("RedisSettings")
);

builder.Services.AddSingleton<IMongoClient>(sp =>
    new MongoClient(builder.Configuration.GetValue<string>("TwitterCloneDatabaseSettings:ConnectionString")));

builder.Services.AddSingleton<IConnectionMultiplexer>(x => ConnectionMultiplexer.Connect(builder.Configuration.GetValue<string>("RedisSettings:Host") + ",password=" + builder.Configuration.GetValue<string>("RedisSettings:Password")));


builder.Services.AddSingleton<ITweetService, TweetService>();

builder.Services.AddControllers();

builder.Services.AddSingleton<JwtTokenHandler>();
builder.Services.AddCustomJwtAuthentication();
builder.Services.AddHttpContextAccessor();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerDocumentation();


builder.Services.AddCors(p => p.AddPolicy("TwitterCloneCorsPolicy", builder =>
   {
       builder.AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithOrigins("http://localhost:4200");
   }));


builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<CacheConsumer>();
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration.GetValue<string>("RabbitMQSettings:Host"), h =>
        {
            h.Username(builder.Configuration.GetValue<string>("RabbitMQSettings:UserName"));
            h.Password(builder.Configuration.GetValue<string>("RabbitMQSettings:Password"));
        });
        cfg.ReceiveEndpoint("cache-queue", e =>
        {
            e.ConfigureConsumer<CacheConsumer>(context);
        });
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseCors("TwitterCloneCorsPolicy");
app.UseSwaggerDocumentation();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
