export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-40 rounded bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-6 flex flex-col gap-3">
            <div className="size-9 rounded-lg bg-muted animate-pulse" />
            <div className="h-8 w-12 rounded bg-muted animate-pulse" />
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-5 w-44 rounded bg-muted animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl border bg-muted/30 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
