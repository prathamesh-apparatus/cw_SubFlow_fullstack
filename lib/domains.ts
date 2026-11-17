// Server-only: domains — mirrors lib/subscriptions.ts conventions (native pg,
// parameterized SQL, ApiError envelope, logActivity after every mutation).
// There is NO projects table in SubFlow: project association is a free-text
// project_name (picked from the distinct names already in use) plus a reserved
// project_id column for a future projects integration (no FK, by design).
// The domains table is bootstrapped lazily (same DDL as
// database/init/006_create_domains.sql) because existing database volumes
// never re-run the init scripts.
import { query } from './db';
import { ApiError } from './http';
import { fmtAmount, logActivity } from './notifications';
import { toDateStr } from './renewal';

let bootstrapPromise: Promise<void> | null = null;

export function ensureDomainsTable(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      try {
        await query(`CREATE TABLE IF NOT EXISTS domains (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          domain_name TEXT NOT NULL,
          domain_type TEXT NOT NULL DEFAULT 'external',
          description TEXT,
          project_id UUID,
          project_name TEXT,
          purchased_from TEXT,
          purchase_date DATE,
          purchase_cost NUMERIC(12,2),
          currency TEXT NOT NULL DEFAULT 'INR',
          billing_cycle TEXT NOT NULL DEFAULT 'yearly',
          custom_billing_days INTEGER,
          invoice_reference TEXT,
          managed_by TEXT,
          management_platform TEXT,
          account_email TEXT,
          responsible_person TEXT,
          nameservers TEXT,
          registration_date DATE,
          expiry_date DATE,
          next_renewal_date DATE,
          renewal_cost NUMERIC(12,2),
          auto_renewal_enabled BOOLEAN NOT NULL DEFAULT FALSE,
          renewal_reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
          reminder_days_before INTEGER NOT NULL DEFAULT 7,
          status TEXT NOT NULL DEFAULT 'active',
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT domains_type_check CHECK (domain_type IN ('internal','external')),
          CONSTRAINT domains_status_check CHECK (status IN ('active','inactive','expired','pending','cancelled')),
          CONSTRAINT domains_billing_cycle_check CHECK (billing_cycle IN ('monthly','yearly','custom')),
          CONSTRAINT domains_purchase_cost_nonneg CHECK (purchase_cost IS NULL OR purchase_cost >= 0),
          CONSTRAINT domains_renewal_cost_nonneg CHECK (renewal_cost IS NULL OR renewal_cost >= 0),
          CONSTRAINT domains_reminder_days_check CHECK (reminder_days_before IN (3,7,15,30)),
          CONSTRAINT domains_custom_days_check CHECK (custom_billing_days IS NULL OR custom_billing_days > 0)
        )`);
        await query('CREATE UNIQUE INDEX IF NOT EXISTS idx_domains_name_lower ON domains (LOWER(domain_name))');
        await query('CREATE INDEX IF NOT EXISTS idx_domains_expiry ON domains (expiry_date)');
        await query('CREATE INDEX IF NOT EXISTS idx_domains_status ON domains (status)');
        await query('CREATE INDEX IF NOT EXISTS idx_domains_type ON domains (domain_type)');
        await query('CREATE INDEX IF NOT EXISTS idx_domains_project ON domains (project_name)');
      } catch (e) {
        console.error('[domains] table bootstrap failed:', e);
      }
    })();
  }
  return bootstrapPromise;
}

const SELECT = 'SELECT d.*, (d.expiry_date - CURRENT_DATE) AS days_remaining FROM domains d';

function fmtDate(d: any): string {
  if (!d) return '—';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function pretty(v: any): string {
  const s = String(v ?? '');
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function money(v: any, currency?: string | null): string {
  return v === null || v === undefined || v === '' ? '—' : fmtAmount(v, currency);
}

const emptyToNull = (v: any) => (v === '' || v === undefined ? null : v);

/** Column values in INSERT/UPDATE order, with the same defaults the DDL declares. */
function cols(dto: any, old?: any) {
  const pick = (key: string) => (dto[key] !== undefined ? dto[key] : old ? old[key] : undefined);
  const rawName = pick('domain_name');
  const name =
    typeof rawName === 'string' && rawName.trim() ? rawName.trim().toLowerCase() : old ? old.domain_name : rawName;
  return [
    name,
    pick('domain_type') || 'external',
    emptyToNull(pick('description')),
    emptyToNull(pick('project_id')),
    emptyToNull(pick('project_name')),
    emptyToNull(pick('purchased_from')),
    emptyToNull(pick('purchase_date')),
    emptyToNull(pick('purchase_cost')),
    pick('currency') || 'INR',
    pick('billing_cycle') || 'yearly',
    emptyToNull(pick('custom_billing_days')),
    emptyToNull(pick('invoice_reference')),
    emptyToNull(pick('managed_by')),
    emptyToNull(pick('management_platform')),
    emptyToNull(pick('account_email')),
    emptyToNull(pick('responsible_person')),
    emptyToNull(pick('nameservers')),
    emptyToNull(pick('registration_date')),
    emptyToNull(pick('expiry_date')),
    emptyToNull(pick('next_renewal_date')),
    emptyToNull(pick('renewal_cost')),
    !!pick('auto_renewal_enabled'),
    pick('renewal_reminder_enabled') === undefined ? true : !!pick('renewal_reminder_enabled'),
    pick('reminder_days_before') ?? 7,
    pick('status') || 'active',
    emptyToNull(pick('notes')),
  ];
}

const COLUMNS =
  'domain_name,domain_type,description,project_id,project_name,purchased_from,purchase_date,purchase_cost,currency,billing_cycle,custom_billing_days,invoice_reference,managed_by,management_platform,account_email,responsible_person,nameservers,registration_date,expiry_date,next_renewal_date,renewal_cost,auto_renewal_enabled,renewal_reminder_enabled,reminder_days_before,status,notes';

export async function createDomain(dto: any) {
  await ensureDomainsTable();
  try {
    const { rows } = await query(
      `INSERT INTO domains (${COLUMNS}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26) RETURNING *, (expiry_date - CURRENT_DATE) AS days_remaining`,
      cols(dto),
    );
    const d = rows[0];
    await logActivity(
      'domain_created',
      'Domain added',
      `${d.domain_name} (${pretty(d.domain_type)}) — registered with ${d.purchased_from || '—'}`,
      null,
    );
    return d;
  } catch (e: any) {
    if (e.code === '23505') throw new ApiError(409, 'Domain with this name already exists');
    throw e;
  }
}

export async function listDomains(q: any = {}) {
  await ensureDomainsTable();
  const page = Math.max(1, parseInt(q.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(q.limit || '10', 10)));
  const where: string[] = [];
  const params: any[] = [];
  const add = (cond: string, val: any) => {
    params.push(val);
    where.push(cond.replace('?', `$${params.length}`));
  };
  if (q.search) {
    params.push(`%${q.search}%`);
    where.push(`d.domain_name ILIKE $${params.length}`);
  }
  if (q.type) add('d.domain_type = ?', q.type);
  if (q.project) add('d.project_name = ?', q.project);
  if (q.registrar) add('d.purchased_from = ?', q.registrar);
  if (q.manager) add('d.managed_by = ?', q.manager);
  if (q.status) add('d.status = ?', q.status);
  const sortCols: Record<string, string> = {
    expiry_date: 'd.expiry_date',
    purchase_cost: 'd.purchase_cost',
    domain_name: 'LOWER(d.domain_name)',
    created_at: 'd.created_at',
  };
  const sortCol = sortCols[q.sort] || 'd.expiry_date';
  const dir = String(q.order || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const order = `${sortCol} ${dir} NULLS LAST`;
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const totalRes = await query(`SELECT COUNT(*)::int AS total FROM domains d ${whereSql}`, params);
  const offset = (page - 1) * limit;
  const { rows } = await query(
    `${SELECT} ${whereSql} ORDER BY ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );
  return {
    items: rows,
    total: totalRes.rows[0].total,
    page,
    limit,
    totalPages: Math.ceil(totalRes.rows[0].total / limit) || 1,
  };
}

export async function getDomain(id: string) {
  await ensureDomainsTable();
  const { rows } = await query(`${SELECT} WHERE d.id = $1`, [id]);
  if (!rows[0]) throw new ApiError(404, 'Domain not found');
  return rows[0];
}

/** Light diff of the key fields for the domain_updated activity message. */
function domainDiff(oldD: any, newD: any): string {
  const changes: string[] = [];
  if (String(oldD.domain_name ?? '') !== String(newD.domain_name ?? ''))
    changes.push(`Domain name (${oldD.domain_name} → ${newD.domain_name})`);
  if (String(oldD.domain_type ?? '') !== String(newD.domain_type ?? ''))
    changes.push(`Type (${pretty(oldD.domain_type)} → ${pretty(newD.domain_type)})`);
  if (String(oldD.project_name ?? '') !== String(newD.project_name ?? ''))
    changes.push(`Project (${oldD.project_name || '—'} → ${newD.project_name || '—'})`);
  if (String(oldD.purchased_from ?? '') !== String(newD.purchased_from ?? ''))
    changes.push(`Purchased from (${oldD.purchased_from || '—'} → ${newD.purchased_from || '—'})`);
  if (String(oldD.managed_by ?? '') !== String(newD.managed_by ?? ''))
    changes.push(`Managed by (${oldD.managed_by || '—'} → ${newD.managed_by || '—'})`);
  if (Number(oldD.purchase_cost ?? NaN) !== Number(newD.purchase_cost ?? NaN) && !(oldD.purchase_cost == null && newD.purchase_cost == null))
    changes.push(`Purchase cost (${money(oldD.purchase_cost, oldD.currency)} → ${money(newD.purchase_cost, newD.currency)})`);
  if (Number(oldD.renewal_cost ?? NaN) !== Number(newD.renewal_cost ?? NaN) && !(oldD.renewal_cost == null && newD.renewal_cost == null))
    changes.push(`Renewal cost (${money(oldD.renewal_cost, oldD.currency)} → ${money(newD.renewal_cost, newD.currency)})`);
  if (toDateStr(oldD.expiry_date) !== toDateStr(newD.expiry_date))
    changes.push(`Expiry date (${fmtDate(oldD.expiry_date)} → ${fmtDate(newD.expiry_date)})`);
  if (String(oldD.status ?? '') !== String(newD.status ?? ''))
    changes.push(`Status (${pretty(oldD.status)} → ${pretty(newD.status)})`);
  if (!!oldD.auto_renewal_enabled !== !!newD.auto_renewal_enabled)
    changes.push(`Auto-renewal (${oldD.auto_renewal_enabled ? 'Yes' : 'No'} → ${newD.auto_renewal_enabled ? 'Yes' : 'No'})`);
  return changes.length ? `Changes: ${changes.join(', ')}` : 'details updated';
}

export async function updateDomain(id: string, dto: any) {
  const old = await getDomain(id);
  try {
    const { rows } = await query(
      `UPDATE domains SET ${COLUMNS.split(',').map((c, i) => `${c}=$${i + 1}`).join(',')}, updated_at=NOW() WHERE id=$27 RETURNING *, (expiry_date - CURRENT_DATE) AS days_remaining`,
      [...cols(dto, old), id],
    );
    const updated = rows[0];
    try {
      await logActivity('domain_updated', 'Domain updated', `${updated.domain_name} — ${domainDiff(old, updated)}`, null);
    } catch (e) {
      console.error('[domains] activity diff failed:', e);
    }
    return updated;
  } catch (e: any) {
    if (e.code === '23505') throw new ApiError(409, 'Domain with this name already exists');
    throw e;
  }
}

export async function deleteDomain(id: string) {
  const existing = await getDomain(id);
  await query('DELETE FROM domains WHERE id=$1', [id]);
  await logActivity('domain_deleted', 'Domain deleted', `${existing.domain_name} was deleted.`, null);
  return { deleted: true };
}

export async function upcomingExpiries() {
  await ensureDomainsTable();
  const { rows } = await query(
    `${SELECT} WHERE d.expiry_date >= CURRENT_DATE AND d.expiry_date <= CURRENT_DATE + INTERVAL '30 days' AND d.status NOT IN ('cancelled') ORDER BY d.expiry_date ASC`,
  );
  return rows;
}

export async function expiredDomains() {
  await ensureDomainsTable();
  const { rows } = await query(
    `${SELECT} WHERE d.expiry_date < CURRENT_DATE AND d.status NOT IN ('cancelled') ORDER BY d.expiry_date DESC`,
  );
  return rows;
}

/** Yearly-normalised domain cost: effective cost is renewal cost when set, else purchase cost. */
const YEARLY = `CASE d.billing_cycle WHEN 'monthly' THEN COALESCE(d.renewal_cost, d.purchase_cost) * 12 WHEN 'yearly' THEN COALESCE(d.renewal_cost, d.purchase_cost) WHEN 'custom' THEN COALESCE(d.renewal_cost, d.purchase_cost) * 365.25 / NULLIF(d.custom_billing_days,0) ELSE COALESCE(d.renewal_cost, d.purchase_cost) END`;

const num = (v: any) => (v === null || v === undefined ? 0 : Number(v));

export async function domainStatistics() {
  await ensureDomainsTable();
  const [counts, costs, byType, byProject, upcoming] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE domain_type='internal')::int AS internal,
        COUNT(*) FILTER (WHERE domain_type='external')::int AS external,
        COUNT(*) FILTER (WHERE status='active')::int AS active,
        COUNT(*) FILTER (WHERE expiry_date < CURRENT_DATE AND status <> 'cancelled')::int AS expired,
        COUNT(*) FILTER (WHERE expiry_date >= CURRENT_DATE AND expiry_date <= CURRENT_DATE + INTERVAL '30 days' AND status <> 'cancelled')::int AS expiring_soon
       FROM domains`,
    ),
    query(
      `SELECT currency, COALESCE(SUM(purchase_cost),0) AS total_purchase, COALESCE(SUM(renewal_cost),0) AS total_renewal, COALESCE(SUM(${YEARLY}),0) AS yearly_cost FROM domains d GROUP BY currency ORDER BY currency`,
    ),
    query(
      `SELECT domain_type, currency, COUNT(*)::int AS count, COALESCE(SUM(purchase_cost),0) AS total_purchase, COALESCE(SUM(renewal_cost),0) AS total_renewal FROM domains GROUP BY domain_type, currency ORDER BY domain_type, currency`,
    ),
    query(
      `SELECT COALESCE(NULLIF(project_name,''),'No project') AS project_name, currency, COUNT(*)::int AS count, COALESCE(SUM(purchase_cost),0) AS total_purchase, COALESCE(SUM(renewal_cost),0) AS total_renewal FROM domains GROUP BY 1, currency ORDER BY 1, currency`,
    ),
    query(
      `SELECT d.*, (COALESCE(d.next_renewal_date, d.expiry_date) - CURRENT_DATE) AS days_remaining FROM domains d WHERE COALESCE(d.next_renewal_date, d.expiry_date) >= CURRENT_DATE AND COALESCE(d.next_renewal_date, d.expiry_date) <= CURRENT_DATE + INTERVAL '60 days' AND d.status <> 'cancelled' ORDER BY COALESCE(d.next_renewal_date, d.expiry_date) ASC LIMIT 5`,
    ),
  ]);
  const c = counts.rows[0] || {};
  return {
    total: c.total ?? 0,
    internal: c.internal ?? 0,
    external: c.external ?? 0,
    active: c.active ?? 0,
    expired: c.expired ?? 0,
    expiringSoon: c.expiring_soon ?? 0,
    costs: costs.rows.map((r: any) => ({
      currency: r.currency,
      totalPurchase: num(r.total_purchase),
      totalRenewal: num(r.total_renewal),
      yearlyCost: num(r.yearly_cost),
    })),
    byType: byType.rows.map((r: any) => ({
      domainType: r.domain_type,
      currency: r.currency,
      count: r.count,
      totalPurchase: num(r.total_purchase),
      totalRenewal: num(r.total_renewal),
    })),
    byProject: byProject.rows.map((r: any) => ({
      projectName: r.project_name,
      currency: r.currency,
      count: r.count,
      totalPurchase: num(r.total_purchase),
      totalRenewal: num(r.total_renewal),
    })),
    upcomingRenewals: upcoming.rows,
  };
}

/** Distinct project names already in use (feeds the form's project picker + the project filter). */
export async function projectsList(): Promise<string[]> {
  await ensureDomainsTable();
  const { rows } = await query(
    `SELECT DISTINCT project_name FROM domains WHERE project_name IS NOT NULL AND project_name <> '' ORDER BY project_name ASC`,
  );
  return rows.map((r: any) => r.project_name);
}

/** Distinct facet values for the Domains page filters (projects + registrars + managers). */
export async function domainFacets() {
  await ensureDomainsTable();
  const [projects, registrars, managers] = await Promise.all([
    projectsList(),
    query(`SELECT DISTINCT purchased_from FROM domains WHERE purchased_from IS NOT NULL AND purchased_from <> '' ORDER BY purchased_from ASC`),
    query(`SELECT DISTINCT managed_by FROM domains WHERE managed_by IS NOT NULL AND managed_by <> '' ORDER BY managed_by ASC`),
  ]);
  return {
    projects,
    registrars: registrars.rows.map((r: any) => r.purchased_from),
    managers: managers.rows.map((r: any) => r.managed_by),
  };
}
