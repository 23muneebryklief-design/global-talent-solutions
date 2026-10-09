# Global Talent Solutions

Multi-project modular monolith built with ASP.NET Core 8 and Supabase.

## Projects

- `GlobalTalentSolutions.Api`: executable composition root and HTTP pipeline.
- `GlobalTalentSolutions.SharedKernel`: integration-event, admin-session and Supabase abstractions.
- `GlobalTalentSolutions.Enquiries`: public submissions and admin enquiry management.
- `GlobalTalentSolutions.Identity`: Supabase Auth login and administrator allowlist.
- `GlobalTalentSolutions.Notifications`: Resend email handler for `EnquiryCreated`.

The API references every module. Modules reference only SharedKernel and never each other. Notifications react to an in-process `EnquiryCreated` integration event.

## Setup

Run `supabase/schema.sql` in the Supabase SQL Editor. Create the administrator under Authentication > Users. Then configure secrets from `src/GlobalTalentSolutions.Api`:

```powershell
dotnet user-secrets set "Supabase:Url" "https://YOUR_PROJECT.supabase.co"
dotnet user-secrets set "Supabase:PublicKey" "YOUR_PUBLIC_KEY"
dotnet user-secrets set "Supabase:SecretKey" "YOUR_SERVER_SECRET_KEY"
dotnet user-secrets set "Supabase:AdminEmails:0" "rashieda@example.com"
```

Keep the secret/service-role key on the server. It bypasses RLS and must never be placed in browser JavaScript.

Email is disabled by default. When an address and verified sending domain are ready:

```powershell
dotnet user-secrets set "Email:Enabled" "true"
dotnet user-secrets set "Email:ApiKey" "YOUR_RESEND_KEY"
dotnet user-secrets set "Email:From" "Global Talent Solutions <notifications@your-domain.co.za>"
dotnet user-secrets set "Email:To" "rashieda@gmail.com"
dotnet user-secrets set "Email:AdminSiteUrl" "https://your-site/admin.html"
```

Run with `dotnet run --project src/GlobalTalentSolutions.Api`.

## API

- `POST /api/enquiries`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/enquiries?status=new&search=name&page=1`
- `GET /api/admin/enquiries/{id}`
- `PATCH /api/admin/enquiries/{id}`

Gmail search URL: `https://mail.google.com/mail/u/0/#search/%22GTS-REFERENCE%22`.
