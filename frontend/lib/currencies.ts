export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

/** Selectable currencies for subscriptions. INR first, then USD/EUR/GBP, then the rest A–Z by code. Stored value is always the ISO code. */
export const CURRENCIES: Currency[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: '$' },
];

export function currencyLabel(c: Currency): string {
  return c.symbol ? `${c.code} — ${c.name} (${c.symbol})` : `${c.code} — ${c.name}`;
}
