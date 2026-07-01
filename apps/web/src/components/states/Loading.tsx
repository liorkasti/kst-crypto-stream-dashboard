export function Loading() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-10 w-full animate-pulse rounded bg-gray-100" />
      ))}
    </div>
  )
}
