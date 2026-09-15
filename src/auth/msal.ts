import {
  BrowserCacheLocation,
  InteractionRequiredAuthError,
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
} from '@azure/msal-browser';

// メールの読み取りに必要な最小権限だけを要求する。メールの変更・送信権限は要求しない。
export const graphScopes = ['User.Read', 'Mail.Read'];

const clientId = import.meta.env.VITE_MS_CLIENT_ID?.trim();

export const hasAuthConfiguration = Boolean(clientId && !/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(clientId));

// ビルド時の環境変数を使うと古いHTTP URLが本番バンドルへ残り得るため、
// OAuthを開始した現在のHTTPSオリジンから毎回決定する。
export const redirectUri = `${window.location.origin}/`;

export const msal = new PublicClientApplication({
  auth: {
    clientId: clientId || '00000000-0000-0000-0000-000000000000',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.SessionStorage,
    storeAuthStateInCookie: false,
  },
  system: {
    allowPlatformBroker: false,
  },
});

export async function initializeAuth(): Promise<AccountInfo | null> {
  await msal.initialize();
  const result: AuthenticationResult | null = await msal.handleRedirectPromise();
  if (result?.account) {
    msal.setActiveAccount(result.account);
    return result.account;
  }
  const account = msal.getActiveAccount() ?? msal.getAllAccounts()[0] ?? null;
  if (account) msal.setActiveAccount(account);
  return account;
}

export async function signIn(): Promise<void> {
  await msal.loginRedirect({ scopes: graphScopes, redirectUri });
}

export async function signOut(account: AccountInfo): Promise<void> {
  await msal.logoutRedirect({ account, postLogoutRedirectUri: redirectUri });
}

export async function getAccessToken(account: AccountInfo): Promise<string> {
  try {
    const result = await msal.acquireTokenSilent({ account, scopes: graphScopes });
    return result.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      await msal.acquireTokenRedirect({ account, scopes: graphScopes, redirectUri });
      throw new Error('AUTH_REDIRECT_STARTED');
    }
    throw error;
  }
}
