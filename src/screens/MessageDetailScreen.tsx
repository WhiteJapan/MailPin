import { useEffect, useState } from 'react';
import type { AccountInfo } from '@azure/msal-browser';
import { ErrorState } from '../components/ErrorState';
import { CalendarIcon, ChevronIcon, ExternalIcon } from '../components/Icons';
import { LoadingState } from '../components/LoadingState';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { getMessageDetail, updateMessageReadState } from '../graph/client';
import { userMessageForError } from '../graph/errors';
import type { MailDetail, MailMessage } from '../types/mail';
import { logSafeError } from '../utils/safeLog';

export function MessageDetailScreen({ account, summary, onBack }: { account: AccountInfo; summary: MailMessage; onBack: () => void }) {
  const [detail, setDetail] = useState<MailDetail>();
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const [isRead, setIsRead] = useState(summary.isRead);
  const [updatingRead, setUpdatingRead] = useState(false);
  const [readNotice, setReadNotice] = useState<string>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarError, setCalendarError] = useState<string>();

  async function toggleRead() {
    const nextState = !isRead;
    setUpdatingRead(true);
    setReadNotice(undefined);
    try {
      await updateMessageReadState(account, summary.id, nextState);
      setIsRead(nextState);
      setReadNotice(nextState ? 'Outlookでも既読にしました' : 'Outlookでも未読にしました');
    } catch (cause) {
      logSafeError('Read state update failed', cause);
      setReadNotice('既読状態を更新できませんでした');
    } finally {
      setUpdatingRead(false);
    }
  }

  useEffect(() => {
    let active = true;
    setDetail(undefined);
    setError(undefined);
    getMessageDetail(account, summary.id)
      .then((result) => { if (active) setDetail(result); })
      .catch((cause) => {
        logSafeError('Message request failed', cause);
        if (active) setError(userMessageForError(cause));
      });
    return () => { active = false; };
  }, [account, summary.id, attempt]);

  useEffect(() => {
    if (summary.isRead) return;
    let active = true;
    setUpdatingRead(true);
    updateMessageReadState(account, summary.id, true)
      .then(() => {
        if (!active) return;
        setIsRead(true);
        setReadNotice('Outlookでも既読にしました');
      })
      .catch((cause) => {
        logSafeError('Automatic read state update failed', cause);
        if (active) setReadNotice('既読状態を更新できませんでした');
      })
      .finally(() => { if (active) setUpdatingRead(false); });
    return () => { active = false; };
  }, [account, summary.id, summary.isRead]);

  const receivedDate = new Date(summary.receivedDateTime);
  const received = Number.isNaN(receivedDate.getTime())
    ? ''
    : new Intl.DateTimeFormat('ja-JP', { dateStyle: 'long', timeStyle: 'short' }).format(receivedDate);

  return (
    <main className="app-screen detail-screen">
      <header className="detail-nav glass-nav">
        <button className="back-button" onClick={onBack}><ChevronIcon />受信トレイ</button>
        <span>メール</span>
        <div aria-hidden="true" />
      </header>
      <article className="message-detail">
        <h1>{summary.subject}</h1>
        <div className="sender-card">
          <div className="avatar" aria-hidden="true">{summary.sender.name.slice(0, 1).toUpperCase()}</div>
          <div><strong>{summary.sender.name}</strong><span>{summary.sender.address}</span></div>
          <time dateTime={summary.receivedDateTime}>{received}</time>
        </div>
        <div className="detail-status-row">
          <span className={`read-status ${isRead ? 'read-status--read' : 'read-status--unread'}`}>{isRead ? '既読' : '未読'}</span>
          <button className="read-toggle-button" disabled={updatingRead} onClick={() => void toggleRead()}>
            {updatingRead ? '更新中…' : isRead ? '未読にする' : '既読にする'}
          </button>
          {readNotice && <span className="read-notice" role="status">{readNotice}</span>}
        </div>
        {detail ? <pre className="message-body">{detail.body}</pre> : error ? <ErrorState message={error} onRetry={() => setAttempt((value) => value + 1)} /> : <LoadingState label="本文を読み込んでいます" />}
        <div className="detail-actions">
          <button className="primary-button" onClick={() => setCalendarOpen(true)}><CalendarIcon />Googleカレンダーに追加</button>
          {summary.webLink && (
            <a className="secondary-button outlook-link" href={summary.webLink} target="_blank" rel="noopener noreferrer">Outlookで開く <ExternalIcon /></a>
          )}
        </div>
        {calendarError && <p className="detail-action-error" role="alert">{calendarError}</p>}
      </article>
      {calendarOpen && <DatePickerSheet mail={summary} onClose={() => setCalendarOpen(false)} onError={() => { setCalendarOpen(false); setCalendarError('Googleカレンダーを開けませんでした'); }} />}
    </main>
  );
}
