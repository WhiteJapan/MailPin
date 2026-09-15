import { useMemo, useState } from 'react';
import { todayInTokyo } from '../calendar/googleCalendar';

interface CalendarPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date: Date): string {
  return `${date.getUTCFullYear().toString().padStart(4, '0')}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;
}

function offsetFromToday(days: number): string {
  const date = parseDate(todayInTokyo());
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date);
}

export function CalendarPicker({ value, onChange }: CalendarPickerProps) {
  const selected = parseDate(value);
  const [year, setYear] = useState(selected.getUTCFullYear());
  const [month, setMonth] = useState(selected.getUTCMonth());
  const today = todayInTokyo();

  const days = useMemo(() => {
    const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(Date.UTC(year, month, 1 - firstWeekday + index));
      return { date, value: formatDate(date), currentMonth: date.getUTCMonth() === month };
    });
  }, [year, month]);

  const years = useMemo(() => Array.from({ length: 16 }, (_, index) => year - 5 + index), [year]);

  function moveMonth(amount: number) {
    const target = new Date(Date.UTC(year, month + amount, 1));
    setYear(target.getUTCFullYear());
    setMonth(target.getUTCMonth());
  }

  function choose(next: string) {
    const date = parseDate(next);
    setYear(date.getUTCFullYear());
    setMonth(date.getUTCMonth());
    onChange(next);
  }

  return (
    <div className="calendar-picker">
      <div className="quick-dates" aria-label="日付のショートカット">
        <button onClick={() => choose(offsetFromToday(0))}>今日</button>
        <button onClick={() => choose(offsetFromToday(1))}>明日</button>
        <button onClick={() => choose(offsetFromToday(7))}>1週間後</button>
      </div>
      <div className="calendar-heading">
        <button onClick={() => moveMonth(-1)} aria-label="前の月">‹</button>
        <div className="month-selects">
          <select value={year} onChange={(event) => setYear(Number(event.target.value))} aria-label="年">
            {years.map((item) => <option key={item} value={item}>{item}年</option>)}
          </select>
          <select value={month} onChange={(event) => setMonth(Number(event.target.value))} aria-label="月">
            {Array.from({ length: 12 }, (_, index) => <option key={index} value={index}>{index + 1}月</option>)}
          </select>
        </div>
        <button onClick={() => moveMonth(1)} aria-label="次の月">›</button>
      </div>
      <div className="calendar-weekdays" aria-hidden="true">
        {weekdays.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-days" role="grid" aria-label={`${year}年${month + 1}月`}>
        {days.map((day, index) => (
          <button
            key={day.value}
            className={`${day.currentMonth ? '' : 'outside'} ${day.value === value ? 'selected' : ''} ${day.value === today ? 'today' : ''}`}
            aria-label={new Intl.DateTimeFormat('ja-JP', { dateStyle: 'full', timeZone: 'UTC' }).format(day.date)}
            aria-pressed={day.value === value}
            aria-current={day.value === today ? 'date' : undefined}
            onClick={() => choose(day.value)}
            role="gridcell"
          >
            <span className={index % 7 === 0 ? 'sunday' : index % 7 === 6 ? 'saturday' : ''}>{day.date.getUTCDate()}</span>
          </button>
        ))}
      </div>
      <p className="selected-date">選択中：{new Intl.DateTimeFormat('ja-JP', { dateStyle: 'long', timeZone: 'UTC' }).format(selected)}</p>
    </div>
  );
}
