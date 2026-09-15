import { describe, expect, it } from 'vitest';
import { buildGoogleCalendarUrl } from './googleCalendar';

const mail = {
  subject: '修学旅行について & 確認?',
  webLink: 'https://outlook.office.com/mail/deeplink/read/abc?x=1&y=2',
  sender: { name: '山田 太郎', address: 'taro@example.com' },
};

function paramsFor(date: string): URLSearchParams {
  return new URL(buildGoogleCalendarUrl(mail, date)).searchParams;
}

describe('buildGoogleCalendarUrl', () => {
  it('日本語や記号を含む件名とOutlookリンクを正しく保持する', () => {
    const params = paramsFor('2026-09-28');
    expect(params.get('text')).toBe(mail.subject);
    expect(params.get('details')).toContain(mail.webLink);
    expect(params.get('details')).toContain('山田 太郎');
    expect(params.get('ctz')).toBe('Asia/Tokyo');
  });

  it.each([
    ['月末', '2026-09-30', '20260930/20261001'],
    ['年末', '2026-12-31', '20261231/20270101'],
    ['うるう年', '2028-02-29', '20280229/20280301'],
  ])('%sの終了日を翌日にする', (_label, input, expected) => {
    expect(paramsFor(input).get('dates')).toBe(expected);
  });

  it('存在しない日付を拒否する', () => {
    expect(() => paramsFor('2026-02-29')).toThrow('INVALID_DATE');
  });
});
