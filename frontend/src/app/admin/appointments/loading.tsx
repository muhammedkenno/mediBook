export default function AppointmentsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-7 w-48 rounded bg-muted animate-pulse" />
      <div className="rounded-lg border overflow-hidden">
        <div className="h-10 bg-muted/50 border-b" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 h-14 border-b last:border-0">
            {Array.from({ length: 6 }).map((__, j) => (
              <div key={j} className="h-4 flex-1 rounded bg-muted animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
