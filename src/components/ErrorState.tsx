interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-card state-card--error" role="alert">
      <div className="state-symbol" aria-hidden="true">!</div>
      <p>{message}</p>
      {onRetry && <button className="secondary-button" onClick={onRetry}>再試行</button>}
    </div>
  );
}
