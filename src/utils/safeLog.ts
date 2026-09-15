export function logSafeError(context: string, error: unknown): void {
  if (!import.meta.env.DEV) return;
  const name = error instanceof Error ? error.name : 'UnknownError';
  const message = error instanceof Error ? error.message : 'Unknown failure';
  console.error(`[MailPin] ${context}: ${name}: ${message}`);
}
