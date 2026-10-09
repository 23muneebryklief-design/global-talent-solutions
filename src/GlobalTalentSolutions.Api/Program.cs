using System.Threading.RateLimiting;
using GlobalTalentSolutions.Enquiries;
using GlobalTalentSolutions.Identity;
using GlobalTalentSolutions.Notifications;
using GlobalTalentSolutions.SharedKernel;
using Microsoft.AspNetCore.RateLimiting;

var builder=WebApplication.CreateBuilder(args);
builder.Services.ConfigureHttpJsonOptions(o => { o.SerializerOptions.PropertyNamingPolicy=System.Text.Json.JsonNamingPolicy.SnakeCaseLower; o.SerializerOptions.DefaultIgnoreCondition=System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull; });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title="Global Talent Solutions API", Version="v1", Description="Enquiry management API backed by Supabase." });
});
builder.Services.AddHttpClient();
builder.Services.AddHttpClient<ISupabaseRestClient,SupabaseRestClient>();
builder.Services.AddScoped<IEventBus,InProcessEventBus>();
builder.Services.AddEnquiriesModule().AddIdentityModule().AddNotificationsModule();
builder.Services.AddRateLimiter(o => { o.RejectionStatusCode=429; o.AddPolicy("public-form",ctx=>RateLimitPartition.GetFixedWindowLimiter(ctx.Connection.RemoteIpAddress?.ToString()??"unknown",_=>new FixedWindowRateLimiterOptions { PermitLimit=5,Window=TimeSpan.FromMinutes(10),QueueLimit=0 })); });

var app=builder.Build();
if(app.Configuration.GetValue("Swagger:Enabled",app.Environment.IsDevelopment()))
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json","Global Talent Solutions API v1");
        options.RoutePrefix="swagger";
        options.DisplayRequestDuration();
    });
}
app.UseHttpsRedirection(); app.UseRateLimiter();
app.MapGet("/api/health",()=>Results.Ok(new { status="ok" })).WithTags("System").WithName("HealthCheck");
app.MapIdentityModule(); app.MapEnquiriesModule();
app.Run();

public sealed class InProcessEventBus(IServiceProvider services) : IEventBus
{
    public async Task Publish<T>(T message,CancellationToken ct) where T:IIntegrationEvent
    {
        foreach(var handler in services.GetServices<IIntegrationEventHandler<T>>()) await handler.Handle(message,ct);
    }
}
