import { buildWhatsAppLink, fillTemplate, formatPhone } from '@/utils/whatsapp';

describe('whatsapp utils', () => {
  test('formatPhone adds plus and strips leading 0', () => {
    expect(formatPhone('62', '08123')).toBe('+628123');
    expect(formatPhone('+62', '8123')).toBe('+628123');
  });

  test('fillTemplate replaces known variables and blanks unknown', () => {
    const tpl = 'Hello {{name}} ({{unknown}})';
    expect(fillTemplate(tpl, { name: 'Aisha' })).toBe('Hello Aisha ()');
  });

  test('buildWhatsAppLink encodes message', () => {
    expect(buildWhatsAppLink('+628123', 'Hi there!')).toBe('https://wa.me/+628123?text=Hi%20there!');
  });
});

