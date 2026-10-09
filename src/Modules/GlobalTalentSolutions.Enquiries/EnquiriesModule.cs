using System.Text;
using System.Net.Http.Json;
using GlobalTalentSolutions.SharedKernel;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace GlobalTalentSolutions.Enquiries;

public static class EnquiriesModule
{
    public static IServiceCollection AddEnquiriesModule(this IServiceCollection services) => services.AddScoped<EnquiryService>();
    public static IEndpointRouteBuilder MapEnquiriesModule(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/enquiries", async (CreateEnquiry request, EnquiryService service, CancellationToken ct) =>
        {
            if (!string.IsNullOrWhiteSpace(request.Website)) return Results.Accepted();
            var errors = request.Validate();
            if (errors.Count > 0) return Results.ValidationProblem(errors);
            var result = await service.Create(request, ct);
            return Results.Created($"/api/enquiries/{result.Id}", new { result.Reference, message = "Your enquiry has been received." });
        }).RequireRateLimiting("public-form").WithTags("Public enquiries").WithName("CreateEnquiry");

        var admin = app.MapGroup("/api/admin/enquiries").AddEndpointFilter<AdminEndpointFilter>();
        admin.MapGet("/", (string? status, string? search, int? page, EnquiryService service, CancellationToken ct) => service.List(status, search, page ?? 1, ct)).WithTags("Admin enquiries").WithName("ListEnquiries");
        admin.MapGet("/{id:guid}", async (Guid id, EnquiryService service, CancellationToken ct) => (await service.Get(id, ct)) is { } item ? Results.Ok(item) : Results.NotFound()).WithTags("Admin enquiries").WithName("GetEnquiry");
        admin.MapPatch("/{id:guid}", async (Guid id, UpdateEnquiry update, EnquiryService service, CancellationToken ct) =>
        {
            if (update.Status is not null && update.Status is not ("new" or "in_progress" or "closed")) return Results.BadRequest(new { message = "Invalid status." });
            return (await service.Update(id, update, ct)) is { } item ? Results.Ok(item) : Results.NotFound();
        }).WithTags("Admin enquiries").WithName("UpdateEnquiry");
        return app;
    }
}

public sealed record CreateEnquiry(string Name, string Email, string? Phone, string? Company, string Service, string Message, string? Website)
{
    public Dictionary<string, string[]> Validate()
    {
        var e = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(Name) || Name.Trim().Length is < 2 or > 100) e["name"] = ["Name must be 2–100 characters."];
        if (!System.Net.Mail.MailAddress.TryCreate(Email, out _)) e["email"] = ["Enter a valid email."];
        if (string.IsNullOrWhiteSpace(Message) || Message.Trim().Length is < 10 or > 4000) e["message"] = ["Message must be 10–4000 characters."];
        return e;
    }
}
public sealed record UpdateEnquiry(string? Status, string? Notes);
public sealed class EnquiryRecord
{
    public Guid Id { get; set; } public string Reference { get; set; } = ""; public string Name { get; set; } = "";
    public string Email { get; set; } = ""; public string? Phone { get; set; } public string? Company { get; set; }
    public string Service { get; set; } = ""; public string Message { get; set; } = ""; public string Status { get; set; } = "new";
    public string Notes { get; set; } = ""; public string NotificationStatus { get; set; } = "pending";
    public DateTimeOffset CreatedAt { get; set; } public DateTimeOffset UpdatedAt { get; set; }
}

public sealed class EnquiryService(ISupabaseRestClient db, IEventBus events)
{
    public async Task<EnquiryRecord> Create(CreateEnquiry input, CancellationToken ct)
    {
        var item = new EnquiryRecord { Id = Guid.NewGuid(), Reference = $"GTS-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000,9999)}", Name = input.Name.Trim(), Email = input.Email.Trim().ToLowerInvariant(), Phone = input.Phone?.Trim(), Company = input.Company?.Trim(), Service = input.Service.Trim(), Message = input.Message.Trim(), CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow };
        using var response = await db.Send(HttpMethod.Post, "/rest/v1/enquiries", item, "return=minimal", ct); await response.EnsureSupabaseSuccess(ct);
        await events.Publish(new EnquiryCreated(item.Id, item.Reference, item.Name, item.Email, item.Phone, item.Company, item.Service, item.Message), ct);
        return item;
    }
    public async Task<List<EnquiryRecord>> List(string? status, string? search, int page, CancellationToken ct)
    {
        var q = new StringBuilder("/rest/v1/enquiries?select=*&order=created_at.desc");
        if (!string.IsNullOrWhiteSpace(status)) q.Append("&status=eq.").Append(Uri.EscapeDataString(status));
        if (!string.IsNullOrWhiteSpace(search)) { var s=Uri.EscapeDataString($"*{search.Trim()}*"); q.Append($"&or=(name.ilike.{s},company.ilike.{s},reference.ilike.{s})"); }
        var safePage=Math.Max(page,1); q.Append($"&limit=25&offset={(safePage-1)*25}");
        using var response = await db.Send(HttpMethod.Get, q.ToString(), null, null, ct); await response.EnsureSupabaseSuccess(ct);
        return await response.Content.ReadFromJsonAsync<List<EnquiryRecord>>(JsonDefaults.Options, ct) ?? [];
    }
    public async Task<EnquiryRecord?> Get(Guid id, CancellationToken ct) { using var r=await db.Send(HttpMethod.Get,$"/rest/v1/enquiries?select=*&id=eq.{id}&limit=1",null,null,ct); await r.EnsureSupabaseSuccess(ct); return (await r.Content.ReadFromJsonAsync<List<EnquiryRecord>>(JsonDefaults.Options,ct))?.FirstOrDefault(); }
    public async Task<EnquiryRecord?> Update(Guid id, UpdateEnquiry u, CancellationToken ct) { using var r=await db.Send(HttpMethod.Patch,$"/rest/v1/enquiries?id=eq.{id}",new { status=u.Status, notes=u.Notes, updated_at=DateTimeOffset.UtcNow },"return=representation",ct); await r.EnsureSupabaseSuccess(ct); return (await r.Content.ReadFromJsonAsync<List<EnquiryRecord>>(JsonDefaults.Options,ct))?.FirstOrDefault(); }
}
