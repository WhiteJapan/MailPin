import { useEffect, useRef, useState } from 'react';
import { buildGoogleCalendarUrl, todayInTokyo } from '../calendar/googleCalendar';
import type { MailMessage } from '../types/mail';
import { CalendarIcon, ExternalIcon } from './Icons';
import { CalendarPicker } from './CalendarPicker';

interface DatePickerSheetProps {
  mail: MailMessage;
  onClose: () => void;
  onError: () => void;
}

export function DatePickerSheet({ mail, onClose, onError }: DatePickerSheetProps) {
  const [date, setDate] = useState(todayInTokyo);
  const sheetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    (sheetRef.current?.querySelector('[aria-pressed="true"]') as HTMLButtonElement | null)?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  function openCalendar() {
    try {
      const url = buildGoogleCalendarUrl(mail, date);
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      if (!opened) window.location.assign(url);
      onClose();
    } catch {
      onError();
    }
  }

  return (
    <div className="sheet-backdrop" role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={sheetRef} className="date-sheet" role="dialog" aria-modal="true" aria-labelledby="date-sheet-title">
        <div className="sheet-handle" aria-hidden="true" />
        <div className="sheet-icon"><CalendarIcon /></div>
        <h2 id="date-sheet-title">このメールをいつに置く？</h2>
        <p className="sheet-subject">{mail.subject}</p>
        <CalendarPicker value={date} onChange={setDate} />
        <div className="sheet-actions">
          <button className="secondary-button" onClick={onClose}>キャンセル</button>
          <button className="primary-button" disabled={!date} onClick={openCalendar}>
            Googleカレンダーで開く <ExternalIcon />
          </button>
        </div>
      </section>
    </div>
  );
}
