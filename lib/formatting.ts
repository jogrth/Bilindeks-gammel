export function formatPrice(price: number | null | undefined): string {
  if (price == null) return 'Ikke oppgitt';
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatNumber(num: number | null | undefined): string {
  if (num == null) return 'Ikke oppgitt';
  return new Intl.NumberFormat('nb-NO').format(num);
}

export function formatRange(km: number | null | undefined): string {
  if (km == null) return 'Ikke oppgitt';
  return `${formatNumber(km)} km`;
}

export function formatCargo(liters: number | null | undefined): string {
  if (liters == null) return 'Ikke oppgitt';
  return `${formatNumber(liters)} L`;
}

export function formatTowing(kg: number | null | undefined): string {
  if (kg == null) return 'Ikke oppgitt';
  return `${formatNumber(kg)} kg`;
}

export function formatChargeSpeed(kw: number | null | undefined): string {
  if (kw == null) return 'Ikke oppgitt';
  return `${formatNumber(kw)} kW`;
}

export function formatSeats(min: number | null | undefined, max: number | null | undefined): string {
  if (min == null && max == null) return 'Ikke oppgitt';
  if (min === max || max == null) return `${min} seter`;
  return `${min}-${max} seter`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[æ]/g, 'ae')
    .replace(/[ø]/g, 'o')
    .replace(/[å]/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
