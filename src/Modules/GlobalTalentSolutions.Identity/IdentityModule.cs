using System.Net.Http.Headers;
using System.Net.Http.Json;
using GlobalTalentSolutions.SharedKernel;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GlobalTalentSolutions.Identity;

public static class IdentityModule
{
    public static IServiceCollection AddIdentityModule(this IServiceCollection services) => services.AddScoped<IAdminSessionValidator, SupabaseAdminSessions>();
    public static IEndpointRouteBuilder MapIdentityModule(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/admin/login", async (LoginRequest login, SupabaseAdminSessions sessions, HttpContext context, CancellationToken ct) =>
            await sessions.SignIn(login, context, ct) ? Results.Ok(new { login.Email }) : Results.Unauthorized()).WithTags("Admin authentication").WithName("AdminLogin");
        app.MapPost("/api/admin/logout", (HttpContext context) => { context.Response.Cookies.Delete("gts_admin", SupabaseAdminSessions.Cookie); return Results.NoContent(); }).WithTags("Admin authentication").WithName("AdminLogout");
        return app;
    }
}

public sealed record LoginRequest(string Email, string Password);
public sealed record AuthUser(string Id, string Email);
public sealed record AuthSession(string AccessToken, int ExpiresIn, AuthUser User);

public sealed class SupabaseAdminSessions(HttpClient http, IConfiguration config) : IAdminSessionValidator
{
    private readonly SupabaseOptions _options = config.GetSection("Supabase").Get<SupabaseOptions>() ?? new();
    public static readonly CookieOptions Cookie = new() { HttpOnly=true, Secure=true, SameSite=SameSiteMode.Strict, Path="/api/admin" };
    public async Task<bool> SignIn(LoginRequest login, HttpContext context, CancellationToken ct)
    {
        using var request=new HttpRequestMessage(HttpMethod.Post,$"{_options.Url.TrimEnd('/')}/auth/v1/token?grant_type=password");
        request.Headers.Add("apikey",_options.PublicKey); request.Content=JsonContent.Create(login);
        using var response=await http.SendAsync(request,ct); if(!response.IsSuccessStatusCode) return false;
        var session=await response.Content.ReadFromJsonAsync<AuthSession>(JsonDefaults.Options,ct);
        if(session is null || !IsAllowed(session.User.Email)) return false;
        context.Response.Cookies.Append("gts_admin",session.AccessToken,new CookieOptions { HttpOnly=true,Secure=true,SameSite=SameSiteMode.Strict,Path="/api/admin",MaxAge=TimeSpan.FromSeconds(session.ExpiresIn) }); return true;
    }
    public async Task<bool> IsAdmin(HttpContext context, CancellationToken ct)
    {
        if(!context.Request.Cookies.TryGetValue("gts_admin",out var token)) return false;
        using var request=new HttpRequestMessage(HttpMethod.Get,$"{_options.Url.TrimEnd('/')}/auth/v1/user"); request.Headers.Add("apikey",_options.PublicKey); request.Headers.Authorization=new AuthenticationHeaderValue("Bearer",token);
        using var response=await http.SendAsync(request,ct); if(!response.IsSuccessStatusCode) return false;
        var user=await response.Content.ReadFromJsonAsync<AuthUser>(JsonDefaults.Options,ct); return user is not null && IsAllowed(user.Email);
    }
    private bool IsAllowed(string email)=>_options.AdminEmails.Contains(email,StringComparer.OrdinalIgnoreCase);
}
