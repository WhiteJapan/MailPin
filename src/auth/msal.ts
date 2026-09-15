import {
  BrowserCacheLocation,
  InteractionRequiredAuthError,
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
} from '@azure/msal-browser';

// Mail.ReadWriteは既読・未読状態をOutlook側へ反映するためにだけ使用する。
// メール送信権限は要求しない。
export const graphScopes = ['User.Read', 'Mail.ReadWrite'];

const clientId = import.meta.env.VITE_MS_CLIENT_ID?.trim();
const configuredRedirect = import.meta.env.VITE_MS_REDIRECT_URI?.trim();

export const hasAuthConfiguration = Boolean(clientId && !/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(clientId));

function defaultRedirectUri(): string {
  return new URL(import.meta.env.BASE_URL, window.location.origin).href;
}

export const redirectUri = configuredRedirect || defaultRedirectUri();

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
