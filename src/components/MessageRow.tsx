import { memo, useEffect, useRef, useState } from 'react';
import type { MailMessage } from '../types/mail';
import { CalendarIcon, MoreIcon } from './Icons';

interface MessageRowProps {
  mail: MailMessage;
  onOpen: () => void;
  onAddToCalendar: () => void;
}

function formatReceived(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return new Intl.DateTimeFormat('ja-JP', sameDay
    ? { hour: '2-digit', minute: '2-digit' }
    : { month: 'numeric', day: 'numeric' }
  ).format(date);
}

export const MessageRow = memo(function MessageRow({ mail, onOpen, onAddToCalendar }: MessageRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [menuOpen]);

  return (
    <article className={`message-row ${mail.isRead ? '' : 'message-row--unread'}`}>
      <button className="message-row__main" onClick={onOpen} aria-label={`${mail.sender.name}からのメール、${mail.subject}`}>
        <span className="unread-dot" aria-label={mail.isRead ? '既読' : '未読'} />
        <span className="message-avatar" aria-hidden="true">{mail.sender.name.slice(0, 1).toUpperCase()}</span>
        <span className="message-row__content">
          <span className="message-row__topline">
            <span className="message-row__sender">
              <strong>{mail.sender.name}</strong>
              <span className={`read-status ${mail.isRead ? 'read-status--read' : 'read-status--unread'}`}>
                {mail.isRead ? '既読' : '未読'}
              </span>
            </span>
            <time dateTime={mail.receivedDateTime}>{formatReceived(mail.receivedDateTime)}</time>
          </span>
          <span className="message-row__subject">{mail.subject}</span>
          <span className="message-row__preview">{mail.bodyPreview}</span>
        </span>
      </button>
      <div className="message-menu" ref={menuRef}>
        <button className="icon-button message-menu__trigger" aria-label={`${mail.subject}のメニュー`} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
          <MoreIcon />
        </button>
        {menuOpen && (
          <div className="message-menu__popover" role="menu">
            <button role="menuitem" onClick={() => { setMenuOpen(false); onAddToCalendar(); }}>
              <CalendarIcon />
              Googleカレンダーに追加
            </button>
          </div>
        )}
      </div>
    </article>
  );
});
