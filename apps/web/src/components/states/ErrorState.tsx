interface Props {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-red-500">
      <p>{message}</p>
      <button
        onClick={onRetry}
        className="rounded bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
      >
        Retry
      </button>
    </div>
  )
}
