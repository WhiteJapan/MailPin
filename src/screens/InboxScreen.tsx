import { useCallback, useEffect, useState } from 'react';
import type { AccountInfo } from '@azure/msal-browser';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { OfflineBanner } from '../components/OfflineBanner';
import { MailIcon, RefreshIcon, SearchIcon } from '../components/Icons';
import { SwipeableMessageRow } from '../components/SwipeableMessageRow';
import { getInbox } from '../graph/client';
import { userMessageForError } from '../graph/errors';
import { useOnline } from '../hooks/useOnline';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import type { MailMessage } from '../types/mail';
import { logSafeError } from '../utils/safeLog';

interface InboxScreenProps {
  account: AccountInfo;
  profilePhotoUrl?: string;
  onOpenMail: (mail: MailMessage) => void;
  onOpenSettings: () => void;
}

export function InboxScreen({ account, profilePhotoUrl, onOpenMail, onOpenSettings }: InboxScreenProps) {
  const online = useOnline();
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [nextLink, setNextLink] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string>();
  const [calendarMail, setCalendarMail] = useState<MailMessage>();
  const [notice, setNotice] = useState<string>();
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLocaleLowerCase('ja');
  const visibleMessages = normalizedQuery
    ? messages.filter((mail) => [mail.sender.name, mail.sender.address, mail.subject, mail.bodyPreview]
        .some((value) => value.toLocaleLowerCase('ja').includes(normalizedQuery)))
    : messages;

  const load = useCallback(async (append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError(undefined);
    try {
      const page = await getInbox(account, append ? nextLink : undefined);
      setMessages((current) => append ? [...current, ...page.messages] : page.messages);
      setNextLink(page.nextLink);
    } catch (cause) {
      logSafeError('Inbox request failed', cause);
      setError(userMessageForError(cause));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [account, nextLink]);

  const refreshInbox = useCallback(async () => { await load(false); }, [load]);
  const pull = usePullToRefresh(refreshInbox, loading || loadingMore || !online);

  useEffect(() => { void load(); }, [account]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main ref={pull.containerRef} className="app-screen inbox-screen">
      <div
        className={`pull-indicator ${pull.refreshing ? 'refreshing' : ''}`}
        style={{ opacity: Math.min(1, pull.distance / 42), transform: `translate(-50%, ${pull.distance - 46}px)` }}
        role="status"
        aria-live="polite"
      >
        <RefreshIcon style={{ transform: pull.refreshing ? undefined : `rotate(${pull.distance * 2.8}deg)` }} />
        <span>{pull.refreshing ? '更新中…' : pull.ready ? '離して更新' : '下に引いて更新'}</span>
      </div>

      <div className={`inbox-content ${pull.pulling ? 'is-pulling' : ''}`} style={{ transform: `translate3d(0, ${pull.distance}px, 0)` }}>
        <header className="top-header">
          <div>
            <p className="header-brand"><span><MailIcon /></span>MailPin</p>
            <h1>受信トレイ</h1>
            <p className="header-subtitle">大切なつながりを、いつもそばに。</p>
          </div>
          <div className="header-actions">
            <button className="profile-button" onClick={onOpenSettings} aria-label="プロフィールと設定を開く">
              {profilePhotoUrl
                ? <img src={profilePhotoUrl} alt="" />
                : <span aria-hidden="true">{(account.name || account.username).slice(0, 1).toUpperCase()}</span>}
            </button>
          </div>
        </header>

        {!online && <OfflineBanner />}
        {notice && <div className="toast" role="alert">{notice}<button onClick={() => setNotice(undefined)} aria-label="閉じる">×</button></div>}

        <label className="search-field">
          <SearchIcon />
          <span className="visually-hidden">メールを検索</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="メールを検索…" />
        </label>

        <section className="mail-list" aria-label="受信メール">
          {loading && messages.length === 0 ? <LoadingState label="受信トレイを読み込んでいます" /> : null}
          {error && messages.length === 0 ? <ErrorState message={error} onRetry={() => void load()} /> : null}
          {!loading && !error && messages.length === 0 ? <div className="empty-state"><span>✓</span><h2>受信トレイは空です</h2><p>新しいメールはここに表示されます。</p></div> : null}
          {!loading && !error && messages.length > 0 && visibleMessages.length === 0 ? <div className="empty-state compact-empty"><h2>見つかりませんでした</h2><p>別の言葉で検索してみてください。</p></div> : null}
          {visibleMessages.map((mail) => (
            <SwipeableMessageRow
              key={mail.id}
              mail={mail}
              onOpen={() => onOpenMail(mail)}
              onAddToCalendar={() => setCalendarMail(mail)}
            />
          ))}
          {error && messages.length > 0 && <ErrorState message={error} onRetry={() => void load(Boolean(nextLink))} />}
          {nextLink && !error && (
            <button className="load-more" disabled={loadingMore} onClick={() => void load(true)}>
              {loadingMore ? '読み込んでいます…' : 'さらに読み込む'}
            </button>
          )}
        </section>
      </div>

      {calendarMail && <DatePickerSheet mail={calendarMail} onClose={() => setCalendarMail(undefined)} onError={() => { setCalendarMail(undefined); setNotice('Googleカレンダーを開けませんでした'); }} />}
    </main>
  );
}
