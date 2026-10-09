using System.Net.Http.Headers;
using System.Net.Http.Json;
using GlobalTalentSolutions.SharedKernel;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GlobalTalentSolutions.Notifications;

public static class NotificationsModule
{
    public static IServiceCollection AddNotificationsModule(this IServiceCollection services) => services.AddScoped<IIntegrationEventHandler<EnquiryCreated>, EnquiryCreatedHandler>();
}
public sealed class EmailOptions { public bool Enabled{get;init;} public string ApiKey{get;init;}=""; public string From{get;init;}=""; public string To{get;init;}=""; public string AdminSiteUrl{get;init;}=""; }
public sealed class EnquiryCreatedHandler(HttpClient http, IConfiguration config, ISupabaseRestClient db) : IIntegrationEventHandler<EnquiryCreated>
{
    private readonly EmailOptions _options=config.GetSection("Email").Get<EmailOptions>()??new();
    public async Task Handle(EnquiryCreated e,CancellationToken ct)
    {
        var status="disabled"; string? providerId=null,error=null;
        if(_options.Enabled && !string.IsNullOrWhiteSpace(_options.To)) try
        {
            using var request=new HttpRequestMessage(HttpMethod.Post,"https://api.resend.com/emails"); request.Headers.Authorization=new AuthenticationHeaderValue("Bearer",_options.ApiKey); request.Headers.Add("Idempotency-Key",$"enquiry/{e.Id}");
            request.Content=JsonContent.Create(new { from=_options.From,to=new[]{_options.To},reply_to=e.Email,subject=$"New enquiry {e.Reference} — {e.Service}",text=$"Reference: {e.Reference}\nName: {e.Name}\nCompany: {e.Company}\nEmail: {e.Email}\nPhone: {e.Phone}\nService: {e.Service}\n\n{e.Message}\n\nDashboard: {_options.AdminSiteUrl}" });
            using var response=await http.SendAsync(request,ct); var body=await response.Content.ReadAsStringAsync(ct); status=response.IsSuccessStatusCode?"sent":"failed"; if(response.IsSuccessStatusCode) providerId=System.Text.Json.JsonDocument.Parse(body).RootElement.GetProperty("id").GetString(); else error=body[..Math.Min(body.Length,500)];
        } catch(Exception ex) { status="failed"; error=ex.Message[..Math.Min(ex.Message.Length,500)]; }
        using var update=await db.Send(HttpMethod.Patch,$"/rest/v1/enquiries?id=eq.{e.Id}",new { notification_status=status,notification_id=providerId,notification_error=error,updated_at=DateTimeOffset.UtcNow },null,ct); await update.EnsureSupabaseSuccess(ct);
    }
}
