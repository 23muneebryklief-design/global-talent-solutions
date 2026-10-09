using System.Threading.RateLimiting;
using GlobalTalentSolutions.Enquiries;
using GlobalTalentSolutions.Identity;
using GlobalTalentSolutions.Notifications;
using GlobalTalentSolutions.SharedKernel;
using Microsoft.AspNetCore.RateLimiting;

var builder=WebApplication.CreateBuilder(args);
builder.Services.ConfigureHttpJsonOptions(o => { o.SerializerOptions.PropertyNamingPolicy=System.Text.Json.JsonNamingPolicy.SnakeCaseLower; o.SerializerOptions.DefaultIgnoreCondition=System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull; });
builder.Services.AddHttpClient();
builder.Services.AddHttpClient<ISupabaseRestClient,SupabaseRestClient>();
builder.Services.AddScoped<IEventBus,InProcessEventBus>();
builder.Services.AddEnquiriesModule().AddIdentityModule().AddNotificationsModule();
builder.Services.AddRateLimiter(o => { o.RejectionStatusCode=429; o.AddPolicy("public-form",ctx=>RateLimitPartition.GetFixedWindowLimiter(ctx.Connection.RemoteIpAddress?.ToString()??"unknown",_=>new FixedWindowRateLimiterOptions { PermitLimit=5,Window=TimeSpan.FromMinutes(10),QueueLimit=0 })); });

var app=builder.Build();
app.UseHttpsRedirection(); app.UseRateLimiter();
app.MapGet("/api/health",()=>Results.Ok(new { status="ok" }));
app.MapIdentityModule(); app.MapEnquiriesModule();
app.Run();

public sealed class InProcessEventBus(IServiceProvider services) : IEventBus
{
    public async Task Publish<T>(T message,CancellationToken ct) where T:IIntegrationEvent
    {
        foreach(var handler in services.GetServices<IIntegrationEventHandler<T>>()) await handler.Handle(message,ct);
    }
}
