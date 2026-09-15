import { useEffect, useState } from 'react';
import type { AccountInfo } from '@azure/msal-browser';
import { LoadingState } from './components/LoadingState';
import { hasAuthConfiguration, initializeAuth, signIn, signOut } from './auth/msal';
import { InboxScreen } from './screens/InboxScreen';
import { LoginScreen } from './screens/LoginScreen';
import { MessageDetailScreen } from './screens/MessageDetailScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import type { MailMessage } from './types/mail';
import { logSafeError } from './utils/safeLog';
import { useTheme } from './hooks/useTheme';
import { getProfilePhoto } from './graph/client';

type View = { name: 'inbox' } | { name: 'settings' } | { name: 'detail'; mail: MailMessage };

export default function App() {
  const { theme, setTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>();
  const [authError, setAuthError] = useState<string>();
  const [view, setView] = useState<View>({ name: 'inbox' });

  useEffect(() => {
    let active = true;
    initializeAuth()
      .then((current) => { if (active) setAccount(current); })
      .catch((error) => {
        logSafeError('Authentication initialization failed', error);
        if (active) setAuthError('サインインを完了できませんでした。もう一度お試しください');
      })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!account) return;
    let active = true;
    let objectUrl: string | undefined;
    setProfilePhotoUrl(undefined);
    getProfilePhoto(account)
      .then((photo) => {
        if (!active || !photo) return;
        objectUrl = URL.createObjectURL(photo);
        setProfilePhotoUrl(objectUrl);
      })
      .catch((error) => logSafeError('Profile photo request failed', error));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [account]);

  async function startSignIn() {
    setAuthError(undefined);
    try { await signIn(); }
    catch (error) {
      logSafeError('Sign-in failed', error);
      setAuthError('サインインを開始できませんでした。もう一度お試しください');
    }
  }

  if (!ready) return <div className="launch-screen"><div className="launch-logo">M</div><LoadingState label="MailPinを準備しています" /></div>;
  if (!account) return <LoginScreen configured={hasAuthConfiguration} error={authError} onSignIn={startSignIn} />;

  if (view.name === 'detail') {
    return <MessageDetailScreen account={account} summary={view.mail} onBack={() => setView({ name: 'inbox' })} />;
  }

  return (
    <div className="app-shell">
      {view.name === 'inbox'
        ? <InboxScreen account={account} profilePhotoUrl={profilePhotoUrl} onOpenMail={(mail) => setView({ name: 'detail', mail })} onOpenSettings={() => setView({ name: 'settings' })} />
        : <SettingsScreen account={account} profilePhotoUrl={profilePhotoUrl} theme={theme} onThemeChange={setTheme} onBack={() => setView({ name: 'inbox' })} onSignOut={() => signOut(account)} />}
    </div>
  );
}
