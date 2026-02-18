import type { CsvRow } from '@/types/blast';

export function formatPhone(phoneCode: string | undefined, phoneNumber: string | undefined) {
  let code = String(phoneCode ?? '').trim();
  let num = String(phoneNumber ?? '').trim();

  if (code && !code.startsWith('+')) code = `+${code}`;
  if (num.startsWith('0')) num = num.slice(1);

  return `${code}${num}`;
}

export function fillTemplate(template: string, row: CsvRow) {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) =>
    Object.prototype.hasOwnProperty.call(row, key) ? String(row[key] ?? '') : ''
  );
}

export function buildWhatsAppLink(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

