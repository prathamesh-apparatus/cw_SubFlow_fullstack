// Server-only: ported verbatim from the old NestJS SubscriptionsService
// (next_renewal_date is always server-computed from start date + billing cycle).

export function toDateStr(v: any): string | null {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

export function computeNextRenewal(
  startDate: string | null,
  billingCycle: string,
  customBillingDays: number | null,
  endDate: string | null,
): string | null {
  if (!startDate) return null;
  if (billingCycle === 'custom' && (!customBillingDays || customBillingDays <= 0)) return null;
  const parse = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  const advance = (ms: number): number => {
    const d = new Date(ms);
    switch (billingCycle) {
      case 'monthly':
        d.setUTCMonth(d.getUTCMonth() + 1);
        break;
      case 'quarterly':
        d.setUTCMonth(d.getUTCMonth() + 3);
        break;
      case 'half_yearly':
        d.setUTCMonth(d.getUTCMonth() + 6);
        break;
      case 'yearly':
        d.setUTCFullYear(d.getUTCFullYear() + 1);
        break;
      case 'custom':
        d.setUTCDate(d.getUTCDate() + (customBillingDays as number));
        break;
      default:
        break;
    }
    return d.getTime();
  };
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  let candidate = advance(parse(startDate));
  let guard = 0;
  while (candidate < today && guard++ < 1200) candidate = advance(candidate);
  if (endDate && candidate > parse(endDate)) return null;
  return fmt(candidate);
}
