using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;

namespace GlobalTalentSolutions.SharedKernel;

public interface IIntegrationEvent;
public interface IIntegrationEventHandler<in T> where T : IIntegrationEvent { Task Handle(T message, CancellationToken ct); }
public interface IEventBus { Task Publish<T>(T message, CancellationToken ct) where T : IIntegrationEvent; }
public interface IAdminSessionValidator { Task<bool> IsAdmin(HttpContext context, CancellationToken ct); }
public sealed class AdminEndpointFilter(IAdminSessionValidator sessions) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next) =>
        await sessions.IsAdmin(context.HttpContext, context.HttpContext.RequestAborted) ? await next(context) : Results.Unauthorized();
}

public sealed record EnquiryCreated(Guid Id, string Reference, string Name, string Email, string? Phone,
    string? Company, string Service, string Message) : IIntegrationEvent;

public sealed class SupabaseOptions
{
    public string Url { get; init; } = "";
    public string SecretKey { get; init; } = "";
    public string PublicKey { get; init; } = "";
    public string[] AdminEmails { get; init; } = [];
}

public interface ISupabaseRestClient
{
    Task<HttpResponseMessage> Send(HttpMethod method, string path, object? body, string? prefer, CancellationToken ct);
}

public sealed class SupabaseRestClient(HttpClient http, IConfiguration config) : ISupabaseRestClient
{
    private readonly SupabaseOptions _options = config.GetSection("Supabase").Get<SupabaseOptions>() ?? new();
    public async Task<HttpResponseMessage> Send(HttpMethod method, string path, object? body, string? prefer, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_options.SecretKey)) throw new InvalidOperationException("Supabase:SecretKey is missing.");
        var request = new HttpRequestMessage(method, $"{_options.Url.TrimEnd('/')}{path}");
        request.Headers.Add("apikey", _options.SecretKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.SecretKey);
        if (prefer is not null) request.Headers.Add("Prefer", prefer);
        if (body is not null) request.Content = JsonContent.Create(body, options: JsonDefaults.Options);
        return await http.SendAsync(request, ct);
    }
}

public static class JsonDefaults
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };
}

public static class HttpResponseExtensions
{
    public static async Task EnsureSupabaseSuccess(this HttpResponseMessage response, CancellationToken ct)
    {
        if (response.IsSuccessStatusCode) return;
        throw new HttpRequestException($"Supabase returned {(int)response.StatusCode}: {await response.Content.ReadAsStringAsync(ct)}");
    }
}
