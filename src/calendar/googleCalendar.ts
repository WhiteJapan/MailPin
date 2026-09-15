import type { MailMessage } from '../types/mail';

const googleCalendarUrl = 'https://calendar.google.com/calendar/r/eventedit';

function parseLocalDate(date: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('INVALID_DATE');
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error('INVALID_DATE');
  }
  return parsed;
}

function formatCompact(date: Date): string {
  return [
    date.getUTCFullYear().toString().padStart(4, '0'),
    (date.getUTCMonth() + 1).toString().padStart(2, '0'),
    date.getUTCDate().toString().padStart(2, '0'),
  ].join('');
}

export function buildGoogleCalendarUrl(
  mail: Pick<MailMessage, 'subject' | 'webLink' | 'sender'>,
  selectedDate: string,
): string {
  const start = parseLocalDate(selectedDate);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const details = [
    'Outlookメールを開く:',
    mail.webLink,
    '',
    '送信者:',
    mail.sender.name,
    '',
    'MailPinから追加',
  ].join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: mail.subject || '（件名なし）',
    dates: `${formatCompact(start)}/${formatCompact(end)}`,
    details,
    ctz: 'Asia/Tokyo',
  });
  return `${googleCalendarUrl}?${params.toString()}`;
}

export function todayInTokyo(now = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
