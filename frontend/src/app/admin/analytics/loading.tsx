export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-32 rounded bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-6 flex flex-col gap-3">
            <div className="size-9 rounded-lg bg-muted animate-pulse" />
            <div className="h-8 w-16 rounded bg-muted animate-pulse" />
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 rounded-xl border p-6 h-72 bg-muted/30 animate-pulse" />
        <div className="rounded-xl border p-6 h-56 bg-muted/30 animate-pulse" />
        <div className="rounded-xl border p-6 h-56 bg-muted/30 animate-pulse" />
        <div className="lg:col-span-2 rounded-xl border p-6 h-48 bg-muted/30 animate-pulse" />
      </div>
    </div>
  )
}
