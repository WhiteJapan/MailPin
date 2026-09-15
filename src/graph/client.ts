import type { AccountInfo } from '@azure/msal-browser';
import { getAccessToken } from '../auth/msal';
import type { MailDetail, MailMessage, MailPage } from '../types/mail';
import { AppError } from './errors';

const graphOrigin = 'https://graph.microsoft.com';
const graphBase = `${graphOrigin}/v1.0`;

interface GraphSender {
  emailAddress?: { name?: string; address?: string };
}

interface GraphMessage {
  id?: string;
  subject?: string;
  from?: GraphSender;
  receivedDateTime?: string;
  isRead?: boolean;
  bodyPreview?: string;
  webLink?: string;
  body?: { content?: string; contentType?: string };
}

interface GraphPage {
  value?: GraphMessage[];
  '@odata.nextLink'?: string;
}

function mapMessage(message: GraphMessage): MailMessage {
  return {
    id: message.id || '',
    subject: message.subject?.trim() || '（件名なし）',
    sender: {
      name: message.from?.emailAddress?.name?.trim() || message.from?.emailAddress?.address || '送信者不明',
      address: message.from?.emailAddress?.address || '',
    },
    receivedDateTime: message.receivedDateTime || '',
    isRead: Boolean(message.isRead),
    bodyPreview: message.bodyPreview || '',
    webLink: message.webLink || '',
  };
}

interface GraphFetchOptions {
  method?: 'GET' | 'PATCH';
  body?: Record<string, unknown>;
}

async function graphFetch<T>(account: AccountInfo, url: string, options: GraphFetchOptions = {}): Promise<T> {
  if (!navigator.onLine) throw new AppError('offline');
  const parsed = new URL(url, graphBase);
  if (parsed.origin !== graphOrigin || !parsed.pathname.startsWith('/v1.0/')) {
    throw new AppError('unknown');
  }

  const token = await getAccessToken(account);
  let response: Response;
  try {
    response = await fetch(parsed.href, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      method: options.method || 'GET',
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new AppError('network');
  }

  if (response.status === 401) throw new AppError('unauthorized');
  if (response.status === 403) throw new AppError('forbidden');
  if (response.status === 429) throw new AppError('rate-limited');
  if (!response.ok) throw new AppError('unknown');
  return response.json() as Promise<T>;
}

export async function getInbox(account: AccountInfo, nextLink?: string): Promise<MailPage> {
  const query = new URLSearchParams({
    '$select': 'id,subject,from,receivedDateTime,isRead,bodyPreview,webLink',
    '$orderby': 'receivedDateTime desc',
    '$top': '25',
  });
  const url = nextLink || `${graphBase}/me/mailFolders/inbox/messages?${query}`;
  const data = await graphFetch<GraphPage>(account, url);
  return {
    messages: (data.value || []).map(mapMessage).filter((message) => message.id),
    nextLink: data['@odata.nextLink'],
  };
}

export async function getMessageDetail(account: AccountInfo, id: string): Promise<MailDetail> {
  const query = new URLSearchParams({
    '$select': 'id,subject,from,receivedDateTime,isRead,bodyPreview,webLink,body',
  });
  const data = await graphFetch<GraphMessage>(
    account,
    `${graphBase}/me/messages/${encodeURIComponent(id)}?${query}`,
  );
  return {
    ...mapMessage(data),
    body: data.body?.content || '本文はありません。',
    bodyContentType: data.body?.contentType?.toLowerCase() === 'html' ? 'html' : 'text',
  };
}

export async function updateMessageReadState(
  account: AccountInfo,
  id: string,
  isRead: boolean,
): Promise<void> {
  await graphFetch<GraphMessage>(
    account,
    `${graphBase}/me/messages/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: { isRead } },
  );
}

export async function getProfilePhoto(account: AccountInfo): Promise<Blob | null> {
  if (!navigator.onLine) return null;
  const token = await getAccessToken(account);
  let response: Response;
  try {
    response = await fetch(`${graphBase}/me/photo/$value`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return null;
  }
  // Microsoftアカウントに画像が未登録の場合は404になる。
  if (response.status === 404) return null;
  if (response.status === 401) throw new AppError('unauthorized');
  if (response.status === 403) throw new AppError('forbidden');
  if (!response.ok) return null;
  return response.blob();
}
