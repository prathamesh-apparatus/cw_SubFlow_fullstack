// Server-only: Brevo notification email — ported verbatim from the old NestJS
// MailService (same branded HTML, same env keys). No BREVO_API_KEY → log + skip,
// never throws. CTA now deep-links to the subscription drawer on All
// Subscriptions (?open=<id>) since the standalone detail page no longer exists.
import { query } from './db';

export interface NotificationSubInfo {
  name: string;
  kind?: string;
  category_name?: string | null;
  managed_by?: string | null;
  total_amount?: number | string | null;
  currency?: string | null;
  next_renewal_date?: string | Date | null;
  status?: string | null;
}

const BADGES: Record<string, { label: string; bg: string; color: string }> = {
  renewal_overdue: { label: 'Overdue', bg: '#FEF2F2', color: '#DC2626' },
  renewal_upcoming: { label: 'Renewing soon', bg: '#FFFBEB', color: '#D97706' },
  payment_failed: { label: 'Payment failed', bg: '#FEF2F2', color: '#DC2626' },
  domain_expiry_upcoming: { label: 'Expiring soon', bg: '#FFFBEB', color: '#D97706' },
  domain_expired: { label: 'Expired', bg: '#FEF2F2', color: '#DC2626' },
};

function esc(v: unknown): string {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtAmount(amount: number | string | null | undefined, currency?: string | null): string {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${currency || 'INR'} ${n.toFixed(2)}`;
  }
}

function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return '—';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function adminEmail(): Promise<string | null> {
  try {
    const { rows } = await query('SELECT email FROM admins ORDER BY created_at ASC LIMIT 1');
    return rows[0]?.email || null;
  } catch {
    return null;
  }
}

function buildHtml(notification: any, sub: NotificationSubInfo | null): string {
  const badge = BADGES[notification.type] || { label: 'Notification', bg: '#F0EDE4', color: '#57534E' };
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const isDomain = typeof notification.type === 'string' && notification.type.startsWith('domain_');
  const cta = notification.subscription_id
    ? `${frontendUrl}/dashboard/subscriptions?open=${notification.subscription_id}`
    : isDomain
      ? `${frontendUrl}/dashboard/domains`
      : `${frontendUrl}/dashboard/notifications`;
  const rows: [string, string][] = [];
  if (sub) {
    if (sub.kind === 'domain') {
      rows.push(['Domain', sub.name]);
      if (sub.managed_by) rows.push(['Managed by', sub.managed_by]);
      if (sub.total_amount !== null && sub.total_amount !== undefined) rows.push(['Renewal cost', fmtAmount(sub.total_amount, sub.currency)]);
      if (sub.next_renewal_date) rows.push(['Expiry date', fmtDate(sub.next_renewal_date)]);
      if (sub.status) rows.push(['Status', sub.status.charAt(0).toUpperCase() + sub.status.slice(1)]);
    } else {
      rows.push(['Subscription', sub.name]);
      if (sub.category_name) rows.push(['Category', sub.category_name]);
      if (sub.total_amount !== null && sub.total_amount !== undefined) rows.push(['Amount', fmtAmount(sub.total_amount, sub.currency)]);
      if (sub.next_renewal_date) rows.push(['Renewal date', fmtDate(sub.next_renewal_date)]);
      if (sub.status) rows.push(['Status', sub.status.charAt(0).toUpperCase() + sub.status.slice(1)]);
    }
  }
  const detailRows = rows
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #F0EDE4;font-size:13px;color:#8A8578;">${esc(k)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #F0EDE4;font-size:13px;color:#1C1917;font-weight:600;text-align:right;">${esc(v)}</td>
      </tr>`,
    )
    .join('');
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#F5F2EB;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2EB;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;border:1px solid #ECE8DD;">
      <tr><td style="padding:32px 32px 8px 32px;">
        <span style="font-size:20px;font-weight:700;color:#141414;">Sub<span style="color:#059669;">Flow</span></span>
      </td></tr>
      <tr><td style="padding:16px 32px 0 32px;"><div style="border-top:1px solid #F0EDE4;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:20px 32px 0 32px;">
        <span style="display:inline-block;background:${badge.bg};color:${badge.color};font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:5px 10px;border-radius:999px;">${esc(badge.label)}</span>
        <h1 style="margin:14px 0 8px 0;font-size:20px;line-height:1.3;color:#111111;font-weight:700;">${esc(notification.title)}</h1>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#44403C;">${esc(notification.message)}</p>
      </td></tr>
      ${detailRows ? `<tr><td style="padding:8px 32px 0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${detailRows}</table></td></tr>` : ''}
      <tr><td style="padding:24px 32px 32px 32px;">
        <a href="${esc(cta)}" style="display:inline-block;background:#141414;color:#FFFFFF;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:600;">View in SubFlow</a>
      </td></tr>
    </table>
    <p style="margin:16px 0 0 0;font-size:12px;color:#9B968A;text-align:center;">You're receiving this because you're the SubFlow admin.</p>
  </td></tr>
</table>
</body></html>`;
}

export async function sendNotificationEmail(notification: any, sub: NotificationSubInfo | null): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log('[mail] BREVO_API_KEY not configured — skipping notification email');
    return;
  }
  try {
    const to = await adminEmail();
    if (!to) {
      console.log('[mail] No admin email found — skipping notification email');
      return;
    }
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'prathameshingle72@gmail.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'SubFlow';
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject: `${notification.title} · SubFlow`,
        htmlContent: buildHtml(notification, sub),
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[mail] Brevo send failed (${res.status}): ${text.slice(0, 200)}`);
    }
  } catch (e: any) {
    console.error('[mail] Brevo send error:', e?.message || e);
  }
}
