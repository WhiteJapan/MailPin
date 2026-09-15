import type { AccountInfo } from '@azure/msal-browser';
import { useState } from 'react';
import { DeviceIcon, MailIcon, MoonIcon, SunIcon } from '../components/Icons';
import type { ThemePreference } from '../hooks/useTheme';

const privacyItems = [
  'MailPinはMicrosoftのパスワードを取得しません',
  'MicrosoftへのログインはMicrosoft公式認証画面で行われます',
  'メール本文はMailPinのサーバーへ保存されません',
  'MailPinにはバックエンドサーバーがありません',
  'メール本文は必要なときだけMicrosoft Graphから取得します',
  'Googleカレンダーへの追加にはGoogleアカウントへのアクセス権を要求しません',
];

interface SettingsScreenProps {
  account: AccountInfo;
  profilePhotoUrl?: string;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  onBack: () => void;
  onSignOut: () => Promise<void>;
}

export function SettingsScreen({ account, profilePhotoUrl, theme, onThemeChange, onBack, onSignOut }: SettingsScreenProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const leave = async () => {
    setBusy(true);
    setError(undefined);
    try { await onSignOut(); }
    catch { setError('サインアウトできませんでした。もう一度お試しください'); }
    finally { setBusy(false); }
  };
  return (
    <main className="app-screen settings-screen">
      <header className="top-header">
        <div><p className="header-brand"><span><MailIcon /></span>MailPin</p><h1>設定</h1><p className="header-subtitle">あなたの使い方に、やさしく寄り添う。</p></div>
        <button className="icon-button glass-button" onClick={onBack} aria-label="受信トレイに戻る"><MailIcon /></button>
      </header>
      <section className="settings-section appearance-section">
        <h2>外観</h2>
        <div className="settings-group appearance-card">
          <div className="theme-picker" role="group" aria-label="表示テーマ">
            <button className={theme === 'light' ? 'active' : ''} aria-pressed={theme === 'light'} onClick={() => onThemeChange('light')}><SunIcon />ライト</button>
            <button className={theme === 'dark' ? 'active' : ''} aria-pressed={theme === 'dark'} onClick={() => onThemeChange('dark')}><MoonIcon />ダーク</button>
            <button className={theme === 'system' ? 'active' : ''} aria-pressed={theme === 'system'} onClick={() => onThemeChange('system')}><DeviceIcon />デバイス</button>
          </div>
          <p>「デバイス」はiPhoneの外観設定に自動で従います。</p>
        </div>
      </section>
      <section className="settings-section">
        <h2>Microsoftアカウント</h2>
        <div className="settings-group account-row">
          <div className="account-identity">
            <span className="account-avatar" aria-hidden="true">{profilePhotoUrl ? <img src={profilePhotoUrl} alt="" /> : (account.name || account.username).slice(0, 1).toUpperCase()}</span>
            <span className="account-copy"><strong>{account.name || 'Microsoftユーザー'}</strong><span>{account.username}</span></span>
          </div>
          <button className="danger-button" disabled={busy} onClick={leave}>{busy ? '処理中…' : 'サインアウト'}</button>
        </div>
        {error && <p className="settings-error" role="alert">{error}</p>}
      </section>
      <section className="settings-section privacy-section">
        <h2>プライバシー</h2>
        <div className="settings-group"><ul>{privacyItems.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>
      <p className="version-label">MailPin 1.0</p>
    </main>
  );
}
