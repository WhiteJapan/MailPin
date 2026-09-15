export type AppErrorKind =
  | 'offline'
  | 'unauthorized'
  | 'forbidden'
  | 'rate-limited'
  | 'network'
  | 'unknown';

export class AppError extends Error {
  constructor(public readonly kind: AppErrorKind) {
    super(kind);
    this.name = 'AppError';
  }
}

export function userMessageForError(error: unknown): string {
  const kind = error instanceof AppError ? error.kind : 'unknown';
  switch (kind) {
    case 'offline':
    case 'network':
      return 'メールを取得するにはインターネット接続が必要です';
    case 'unauthorized':
      return 'サインインの有効期限が切れました。もう一度サインインしてください';
    case 'forbidden':
      return 'メールを読む権限がありません。Mail.Read の許可を確認してください';
    case 'rate-limited':
      return 'Microsoftへのアクセスが混み合っています。少し待って再試行してください';
    default:
      return 'メールを読み込めませんでした';
  }
}
