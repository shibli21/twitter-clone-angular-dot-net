using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("ocelot.json", optional: false, reloadOnChange: true)
        .AddEnvironmentVariables();

builder.Services.AddCors(p => p.AddPolicy("TwitterCloneCorsPolicy", builder =>
   {
       builder.AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithOrigins("http://localhost:4200", "http://noobmasters.learnathon.net/web");
   }));




builder.Services.AddOcelot(builder.Configuration);

var app = builder.Build();

app.UseCors("TwitterCloneCorsPolicy");

app.MapGet("/", () => "Hello World!");

await app.UseOcelot();


app.Run();
