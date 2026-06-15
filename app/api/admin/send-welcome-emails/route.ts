import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { protectAdminRoute } from '@/lib/auth/api-protection';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const authCheck = await protectAdminRoute();
  if (authCheck) return authCheck;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kenavo2k.com';

  try {
    // 1. Get all non-Gmail profiles that have an email
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email')
      .not('email', 'is', null)
      .neq('email', '');

    if (profilesError) {
      return NextResponse.json(
        { error: 'Failed to load profiles: ' + profilesError.message },
        { status: 500 }
      );
    }

    // 2. Get all existing auth users — only email/password users can receive this
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const authUsersByEmail = new Map(
      (authData?.users ?? []).map(u => [u.email?.toLowerCase(), u])
    );

    const results = {
      sent: [] as { name: string; email: string }[],
      skippedGmail: [] as { name: string; email: string }[],
      skippedNoAccount: [] as { name: string; email: string }[],
      failed: [] as { name: string; email: string; reason: string }[],
    };

    // 3. Process each non-Gmail profile that has an auth account
    for (const profile of profiles ?? []) {
      const email = profile.email?.trim().toLowerCase();
      const name = profile.name ?? 'Alumni';

      if (!email || !email.includes('@')) continue;

      if (email.endsWith('@gmail.com')) {
        results.skippedGmail.push({ name, email: profile.email });
        continue;
      }

      const authUser = authUsersByEmail.get(email);
      if (!authUser) {
        results.skippedNoAccount.push({ name, email: profile.email });
        continue;
      }

      // 4. Generate a one-time password recovery link via Supabase Admin API
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: profile.email,
        options: {
          redirectTo: `${siteUrl}/update-password`,
        },
      });

      if (linkError || !linkData?.properties?.action_link) {
        console.error(`Failed to generate link for ${profile.email}:`, linkError?.message);
        results.failed.push({
          name,
          email: profile.email,
          reason: linkError?.message ?? 'Could not generate reset link',
        });
        continue;
      }

      const resetLink = linkData.properties.action_link;

      // 5. Send the welcome email via Resend
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@kenavo2k.com',
          to: profile.email,
          subject: 'Your Kenavo Alumni Directory Access — Set Your Password',
          html: buildWelcomeEmail({ name, email: profile.email, resetLink, siteUrl }),
        });

        console.log(`✅ Welcome email sent to ${profile.email}`);
        results.sent.push({ name, email: profile.email });
      } catch (emailErr: any) {
        console.error(`Failed to send email to ${profile.email}:`, emailErr?.message);
        results.failed.push({
          name,
          email: profile.email,
          reason: emailErr?.message ?? 'Email send failed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        sent: results.sent.length,
        skippedGmail: results.skippedGmail.length,
        skippedNoAccount: results.skippedNoAccount.length,
        failed: results.failed.length,
      },
      details: results,
      message: `Sent ${results.sent.length} welcome emails. ${results.skippedGmail.length} Gmail users skipped (use Google Sign-In). ${results.skippedNoAccount.length} have no login account yet.`,
    });
  } catch (err: any) {
    console.error('send-welcome-emails error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildWelcomeEmail({
  name,
  email,
  resetLink,
  siteUrl,
}: {
  name: string;
  email: string;
  resetLink: string;
  siteUrl: string;
}): string {
  const firstName = name.split(' ')[0];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Kenavo Alumni Directory Access</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f1fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f1fa;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4E2E8C 0%,#7C3AED 100%);border-radius:16px 16px 0 0;padding:48px 40px 36px;text-align:center;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7);">Montfort School · Class of 2000</p>
              <h1 style="margin:0 0 8px;font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;">Kenavo Alumni Directory</h1>
              <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);">Reunion 2025 — Your access is ready</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;">
              <p style="margin:0 0 24px;font-size:20px;font-weight:700;color:#1f1f2e;">Hi ${firstName}! 👋</p>
              <p style="margin:0 0 18px;font-size:15px;color:#4b5563;line-height:1.7;">
                We've created your login account for the <strong>Kenavo Alumni Directory</strong> so you can connect with your batchmates from the Montfort Class of 2000.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#4b5563;line-height:1.7;">
                Click the button below to set your own password and start exploring the directory. The link is valid for <strong>24 hours</strong> and can only be used once.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:0 0 32px;">
                    <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#4E2E8C,#7C3AED);color:#ffffff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:10px;text-decoration:none;letter-spacing:0.3px;">
                      Set My Password →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Account info box -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:20px 24px;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6d28d9;">Your Login Details</p>
                    <p style="margin:0 0 4px;font-size:14px;color:#374151;"><strong>Email:</strong> ${email}</p>
                    <p style="margin:0;font-size:14px;color:#374151;"><strong>Password:</strong> You'll set this when you click the button above</p>
                  </td>
                </tr>
              </table>

              <!-- Steps -->
              <p style="margin:0 0 16px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;">How to get started</p>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:8px 0;vertical-align:top;">
                    <span style="display:inline-block;width:28px;height:28px;background:#4E2E8C;color:#fff;border-radius:50%;text-align:center;line-height:28px;font-weight:700;font-size:13px;margin-right:12px;">1</span>
                    <span style="font-size:14px;color:#374151;">Click <strong>"Set My Password"</strong> above</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;">
                    <span style="display:inline-block;width:28px;height:28px;background:#4E2E8C;color:#fff;border-radius:50%;text-align:center;line-height:28px;font-weight:700;font-size:13px;margin-right:12px;">2</span>
                    <span style="font-size:14px;color:#374151;">Choose a password you'll remember</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;">
                    <span style="display:inline-block;width:28px;height:28px;background:#4E2E8C;color:#fff;border-radius:50%;text-align:center;line-height:28px;font-weight:700;font-size:13px;margin-right:12px;">3</span>
                    <span style="font-size:14px;color:#374151;">Explore the alumni directory and reconnect!</span>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />

              <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:12px;word-break:break-all;">
                <a href="${resetLink}" style="color:#7C3AED;text-decoration:none;">${resetLink}</a>
              </p>

              <p style="margin:0;font-size:14px;color:#6b7280;">
                If you didn't expect this email, you can safely ignore it — your account won't be activated until you click the link above.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
                Kenavo Alumni Directory · Montfort School Class of 2000
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                <a href="${siteUrl}/login" style="color:#7C3AED;text-decoration:none;">Sign In</a> ·
                <a href="${siteUrl}/contact" style="color:#7C3AED;text-decoration:none;">Contact Us</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
