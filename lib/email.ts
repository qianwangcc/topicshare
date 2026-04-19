import { Resend } from 'resend';

export async function sendMagicLink(email: string, url: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'TopicShare <onboarding@resend.dev>',
    to: email,
    subject: 'Your login link for TopicShare',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#9333ea;">TopicShare</h2>
        <p>Click the button below to log in. This link expires in 15 minutes.</p>
        <a href="${url}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#9333ea;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
          Log in to TopicShare
        </a>
        <p style="color:#888;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
