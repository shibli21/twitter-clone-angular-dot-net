using Core.Extensions;
using Core.Interfaces;
using Infrastructure.Config;
using Infrastructure.Services;
using Infrastructure.Middlewares;
using JWTAuthenticationManager;
using MassTransit;
using Microsoft.AspNetCore.Http.Connections;
using MongoDB.Driver;
using NotificationService.Consumers;
using NotificationService.Hubs;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, lc) => lc.WriteTo.Console());

builder.Services.Configure<TwitterCloneDbConfig>(
    builder.Configuration.GetSection("TwitterCloneDatabaseSettings")
);

builder.Services.Configure<TwitterCloneSmtpConfig>(
    builder.Configuration.GetSection("EmailSettings")
);

builder.Services.AddSingleton<IMongoClient>(sp =>
    new MongoClient(builder.Configuration.GetValue<string>("TwitterCloneDatabaseSettings:ConnectionString")));

builder.Services.AddSingleton<INotificationsService, NotificationsService>();

builder.Services.AddControllers();

builder.Services.AddSingleton<JwtTokenHandler>();
builder.Services.AddCustomJwtAuthentication();

builder.Services.AddHttpContextAccessor();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerDocumentation();

builder.Services.AddCors(p => p.AddPolicy("TwitterCloneCorsPolicy", builder =>
   {
       builder.AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithOrigins("http://localhost:4200", "http://noobmasters.learnathon.net/web");
   }));




builder.Services.AddSignalR();

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<NotificationConsumer>();
    x.AddConsumer<EmailConsumer>();
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration.GetValue<string>("RabbitMQSettings:Host"), h =>
        {
            h.Username(builder.Configuration.GetValue<string>("RabbitMQSettings:UserName"));
            h.Password(builder.Configuration.GetValue<string>("RabbitMQSettings:Password"));
        });
        cfg.ReceiveEndpoint("notification-service", e =>
        {
            e.ConfigureConsumer<NotificationConsumer>(context);
        });
        cfg.ReceiveEndpoint("email-service", e =>
        {
            e.ConfigureConsumer<EmailConsumer>(context);
        });
    });
});


var app = builder.Build();

app.UseRouting();

app.UseCors("TwitterCloneCorsPolicy");

app.UseSwaggerDocumentation();

app.UseAuthentication();

app.UseAuthorization();

app.MapHub<NotificationHub>("/live-notification", (option) =>
{
    option.Transports = HttpTransportType.LongPolling;
});

app.UseUserBlockedMiddleware();

app.MapControllers();

app.Run();
