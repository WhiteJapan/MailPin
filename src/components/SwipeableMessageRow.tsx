import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { MailMessage } from '../types/mail';
import { CalendarIcon } from './Icons';
import { MessageRow } from './MessageRow';

const triggerDistance = 80;
const maxDistance = 126;

interface SwipeableMessageRowProps {
  mail: MailMessage;
  onOpen: () => void;
  onAddToCalendar: () => void;
}

export function SwipeableMessageRow(props: SwipeableMessageRowProps) {
  const [offset, setOffset] = useState(0);
  const gesture = useRef<{ id: number; x: number; y: number; horizontal: boolean | null } | null>(null);
  const moved = useRef(false);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.clientX <= 20 || event.pointerType === 'mouse' && event.button !== 0) return;
    if ((event.target as HTMLElement).closest('.message-menu')) return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: null };
    moved.current = false;
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (current.horizontal === null && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
      current.horizontal = dx > 0 && Math.abs(dx) > Math.abs(dy) * 1.2;
      if (current.horizontal && !event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    if (!current.horizontal) return;
    event.preventDefault();
    moved.current = true;
    setOffset(Math.min(maxDistance, Math.max(0, dx)));
  }

  function finish(event: ReactPointerEvent<HTMLDivElement>) {
    const shouldTrigger = Boolean(gesture.current?.horizontal && offset >= triggerDistance);
    if (gesture.current && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    gesture.current = null;
    setOffset(0);
    if (shouldTrigger) props.onAddToCalendar();
  }

  return (
    <div className={`swipe-row ${offset ? 'swipe-row--moving' : ''}`}>
      <div className={`swipe-action ${offset >= triggerDistance ? 'swipe-action--ready' : ''}`} aria-hidden="true">
        <CalendarIcon />
        <span>予定に追加</span>
      </div>
      <div
        className="swipe-row__foreground"
        style={{ transform: `translate3d(${offset}px, 0, 0)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        onClickCapture={(event) => { if (moved.current) { event.preventDefault(); event.stopPropagation(); moved.current = false; } }}
      >
        <MessageRow {...props} />
      </div>
    </div>
  );
}
