// Server-only: mirrors the NestJS DTO validation (class-validator + ValidationPipe
// with whitelist) for the fields the forms send — same 400 status and the same
// message strings, returned as an array exactly like Nest did.
import { ApiError } from './http';

type Rule =
  | { kind: 'string' }
  | { kind: 'email' }
  | { kind: 'number' }
  | { kind: 'int' }
  | { kind: 'boolean' }
  | { kind: 'uuid' }
  | { kind: 'min'; value: number }
  | { kind: 'minLength'; value: number }
  | { kind: 'maxLength'; value: number }
  | { kind: 'notEmpty' }
  | { kind: 'date' }
  | { kind: 'domain' }
  | { kind: 'in'; values: (string | number)[] };

interface FieldSpec {
  name: string;
  optional?: boolean;
  /** @Type(() => Number) in the Nest DTO: string values are coerced to Number first. */
  coerceNumber?: boolean;
  rules: Rule[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const DOMAIN_RE = /^(?=.{1,253}$)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/i;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: unknown): boolean {
  if (typeof value !== 'string' || !ISO_DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function checkRule(field: string, value: any, rule: Rule): string | null {
  switch (rule.kind) {
    case 'string':
      return typeof value === 'string' ? null : `${field} must be a string`;
    case 'email':
      return typeof value === 'string' && EMAIL_RE.test(value) ? null : `${field} must be an email`;
    case 'number':
      return typeof value === 'number' && !Number.isNaN(value)
        ? null
        : `${field} must be a number conforming to the specified constraints`;
    case 'int':
      return typeof value === 'number' && Number.isInteger(value) ? null : `${field} must be an integer number`;
    case 'boolean':
      return typeof value === 'boolean' ? null : `${field} must be a boolean value`;
    case 'uuid':
      return typeof value === 'string' && UUID_RE.test(value) ? null : `${field} must be a UUID`;
    case 'min':
      return typeof value === 'number' && value >= rule.value ? null : `${field} must not be less than ${rule.value}`;
    case 'minLength':
      return typeof value === 'string' && value.length >= rule.value
        ? null
        : `${field} must be longer than or equal to ${rule.value} characters`;
    case 'maxLength':
      return typeof value === 'string' && value.length <= rule.value
        ? null
        : `${field} must be shorter than or equal to ${rule.value} characters`;
    case 'notEmpty':
      return value !== '' && value !== null && value !== undefined ? null : `${field} should not be empty`;
    case 'date':
      return isValidIsoDate(value) ? null : `${field} must be a valid ISO 8601 date string`;
    case 'domain':
      return typeof value === 'string' && DOMAIN_RE.test(value.trim())
        ? null
        : `${field} must be a valid domain name`;
    case 'in':
      return rule.values.includes(value)
        ? null
        : `${field} must be one of the following values: ${rule.values.join(', ')}`;
  }
}

/**
 * Validate `body` against the spec (in field order, like the DTO classes).
 * Returns a whitelisted copy containing only the spec fields (Nest's
 * ValidationPipe whitelist stripped everything else). Throws ApiError(400)
 * with the array of class-validator messages on failure.
 */
export function validateBody(body: any, spec: FieldSpec[]): Record<string, any> {
  const src = body && typeof body === 'object' ? body : {};
  const errors: string[] = [];
  const out: Record<string, any> = {};
  for (const field of spec) {
    let value = src[field.name];
    if (value === undefined || value === null) {
      if (field.optional) {
        if (value !== undefined) out[field.name] = value;
        continue;
      }
      // Required field missing: class-validator runs every rule against undefined.
      for (const rule of field.rules) {
        const msg = checkRule(field.name, value, rule);
        if (msg) errors.push(msg);
      }
      continue;
    }
    if (field.coerceNumber && typeof value === 'string' && value.trim() !== '') value = Number(value);
    for (const rule of field.rules) {
      const msg = checkRule(field.name, value, rule);
      if (msg) errors.push(msg);
    }
    out[field.name] = value;
  }
  if (errors.length) throw new ApiError(400, errors);
  return out;
}

export const loginSpec: FieldSpec[] = [
  { name: 'email', rules: [{ kind: 'email' }] },
  { name: 'password', rules: [{ kind: 'string' }, { kind: 'minLength', value: 1 }] },
];

export const changePasswordSpec: FieldSpec[] = [
  { name: 'currentPassword', rules: [{ kind: 'string' }, { kind: 'notEmpty' }] },
  { name: 'newPassword', rules: [{ kind: 'string' }, { kind: 'minLength', value: 8 }] },
];

export const updateProfileSpec: FieldSpec[] = [{ name: 'email', rules: [{ kind: 'email' }] }];

export const createCategorySpec: FieldSpec[] = [
  { name: 'name', rules: [{ kind: 'string' }, { kind: 'minLength', value: 1 }, { kind: 'maxLength', value: 255 }] },
  { name: 'description', optional: true, rules: [{ kind: 'string' }] },
];

export const updateCategorySpec: FieldSpec[] = [
  { name: 'name', optional: true, rules: [{ kind: 'string' }, { kind: 'minLength', value: 1 }, { kind: 'maxLength', value: 255 }] },
  { name: 'description', optional: true, rules: [{ kind: 'string' }] },
];

export const subscriptionSpec: FieldSpec[] = [
  { name: 'category_id', rules: [{ kind: 'uuid' }] },
  { name: 'name', rules: [{ kind: 'string' }] },
  { name: 'description', optional: true, rules: [{ kind: 'string' }] },
  { name: 'website_url', optional: true, rules: [{ kind: 'string' }] },
  { name: 'account_email', rules: [{ kind: 'email' }] },
  { name: 'account_username', optional: true, rules: [{ kind: 'string' }] },
  { name: 'price', coerceNumber: true, rules: [{ kind: 'number' }, { kind: 'min', value: 0 }] },
  { name: 'currency', optional: true, rules: [{ kind: 'string' }] },
  { name: 'billing_cycle', rules: [{ kind: 'in', values: ['monthly', 'quarterly', 'half_yearly', 'yearly', 'custom'] }] },
  { name: 'custom_billing_days', optional: true, coerceNumber: true, rules: [{ kind: 'int' }, { kind: 'min', value: 1 }] },
  { name: 'tax_amount', optional: true, coerceNumber: true, rules: [{ kind: 'number' }, { kind: 'min', value: 0 }] },
  { name: 'payment_method', optional: true, rules: [{ kind: 'in', values: ['credit_card', 'debit_card', 'upi', 'net_banking', 'other'] }] },
  { name: 'auto_pay_enabled', optional: true, rules: [{ kind: 'boolean' }] },
  { name: 'payment_status', optional: true, rules: [{ kind: 'in', values: ['paid', 'pending', 'failed'] }] },
  { name: 'payment_notes', optional: true, rules: [{ kind: 'string' }] },
  { name: 'start_date', optional: true, rules: [{ kind: 'string' }] },
  { name: 'last_payment_date', optional: true, rules: [{ kind: 'string' }] },
  { name: 'next_renewal_date', optional: true, rules: [{ kind: 'string' }] },
  { name: 'end_date', optional: true, rules: [{ kind: 'string' }] },
  { name: 'renewal_reminder', optional: true, rules: [{ kind: 'boolean' }] },
  { name: 'reminder_days_before', optional: true, coerceNumber: true, rules: [{ kind: 'in', values: [3, 7, 15, 30] }] },
  { name: 'status', optional: true, rules: [{ kind: 'in', values: ['active', 'inactive', 'cancelled', 'expired', 'trial'] }] },
  { name: 'auto_renewal_enabled', optional: true, rules: [{ kind: 'boolean' }] },
  { name: 'notes', optional: true, rules: [{ kind: 'string' }] },
];

const domainFields: FieldSpec[] = [
  { name: 'domain_name', rules: [{ kind: 'string' }, { kind: 'notEmpty' }, { kind: 'domain' }] },
  { name: 'domain_type', optional: true, rules: [{ kind: 'in', values: ['internal', 'external'] }] },
  { name: 'description', optional: true, rules: [{ kind: 'string' }] },
  { name: 'project_id', optional: true, rules: [{ kind: 'uuid' }] },
  { name: 'project_name', optional: true, rules: [{ kind: 'string' }] },
  { name: 'purchased_from', optional: true, rules: [{ kind: 'string' }] },
  { name: 'purchase_date', optional: true, rules: [{ kind: 'date' }] },
  { name: 'purchase_cost', optional: true, coerceNumber: true, rules: [{ kind: 'number' }, { kind: 'min', value: 0 }] },
  { name: 'currency', optional: true, rules: [{ kind: 'string' }] },
  { name: 'billing_cycle', optional: true, rules: [{ kind: 'in', values: ['monthly', 'yearly', 'custom'] }] },
  { name: 'custom_billing_days', optional: true, coerceNumber: true, rules: [{ kind: 'int' }, { kind: 'min', value: 1 }] },
  { name: 'invoice_reference', optional: true, rules: [{ kind: 'string' }] },
  { name: 'managed_by', optional: true, rules: [{ kind: 'string' }] },
  { name: 'management_platform', optional: true, rules: [{ kind: 'string' }] },
  { name: 'account_email', optional: true, rules: [{ kind: 'email' }] },
  { name: 'responsible_person', optional: true, rules: [{ kind: 'string' }] },
  { name: 'nameservers', optional: true, rules: [{ kind: 'string' }] },
  { name: 'registration_date', optional: true, rules: [{ kind: 'date' }] },
  { name: 'expiry_date', optional: true, rules: [{ kind: 'date' }] },
  { name: 'next_renewal_date', optional: true, rules: [{ kind: 'date' }] },
  { name: 'renewal_cost', optional: true, coerceNumber: true, rules: [{ kind: 'number' }, { kind: 'min', value: 0 }] },
  { name: 'auto_renewal_enabled', optional: true, rules: [{ kind: 'boolean' }] },
  { name: 'renewal_reminder_enabled', optional: true, rules: [{ kind: 'boolean' }] },
  { name: 'reminder_days_before', optional: true, coerceNumber: true, rules: [{ kind: 'in', values: [3, 7, 15, 30] }] },
  { name: 'status', optional: true, rules: [{ kind: 'in', values: ['active', 'inactive', 'expired', 'pending', 'cancelled'] }] },
  { name: 'notes', optional: true, rules: [{ kind: 'string' }] },
];

export const createDomainSpec: FieldSpec[] = domainFields;

/** PATCH: every field optional (including domain_name); the service merges with the stored row. */
export const updateDomainSpec: FieldSpec[] = domainFields.map((f) =>
  f.name === 'domain_name' ? { ...f, optional: true } : f,
);
