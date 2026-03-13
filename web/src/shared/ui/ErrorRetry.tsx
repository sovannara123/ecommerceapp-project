interface ErrorRetryProps {
  message?: string;
  detail?: string;
  onRetry: () => void;
}

export function ErrorRetry({
  message = "Something went wrong",
  detail,
  onRetry,
}: ErrorRetryProps) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: "rgb(var(--color-error) / 0.1)" }}
      >
        <span className="text-3xl">!</span>
      </div>
      <h3 className="mb-2 text-lg font-semibold">{message}</h3>
      {detail ? (
        <p className="mb-4 text-sm text-[rgb(var(--color-text-secondary))]">
          {detail}
        </p>
      ) : null}
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--color-accent))] px-5 py-2.5 font-medium text-white transition-colors hover:bg-[rgb(var(--color-accent-hover))]"
      >
        Try Again
      </button>
    </div>
  );
}
