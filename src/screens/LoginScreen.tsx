import { useState } from 'react';
import { MailIcon } from '../components/Icons';

interface LoginScreenProps {
  configured: boolean;
  error?: string;
  onSignIn: () => Promise<void>;
}

export function LoginScreen({ configured, error, onSignIn }: LoginScreenProps) {
  const [busy, setBusy] = useState(false);
  const start = async () => {
    setBusy(true);
    try { await onSignIn(); } finally { setBusy(false); }
  };

  return (
    <main className="login-screen">
      <div className="login-orb login-orb--one" />
      <div className="login-orb login-orb--two" />
      <section className="login-card">
        <div className="app-mark"><MailIcon /></div>
        <p className="eyebrow">PRIVATE BY DESIGN</p>
        <h1>MailPin</h1>
        <p>Outlookのメールを、忘れない予定に。</p>
        {!configured ? (
          <div className="config-warning" role="alert">
            <strong>初期設定が必要です</strong>
            <span><code>VITE_MS_CLIENT_ID</code> を設定してから起動してください。</span>
          </div>
        ) : (
          <button className="microsoft-button" disabled={busy} onClick={start}>
            <span className="ms-logo" aria-hidden="true"><i/><i/><i/><i/></span>
            {busy ? 'Microsoftを開いています…' : 'Microsoftでサインイン'}
          </button>
        )}
        {error && <p className="login-error" role="alert">{error}</p>}
        <p className="privacy-note">パスワードはMicrosoft公式画面で入力され、MailPinが取得することはありません。</p>
      </section>
    </main>
  );
}
