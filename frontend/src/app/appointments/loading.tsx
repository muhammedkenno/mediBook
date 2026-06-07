export default function AppointmentsLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-16 border-b bg-background/70" />
      <div className="flex-1 px-4 py-12 max-w-3xl mx-auto w-full">
        <div className="flex items-start justify-between mb-8">
          <div className="flex flex-col gap-2">
            <div className="h-7 w-44 rounded bg-muted animate-pulse" />
            <div className="h-4 w-72 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-8 w-36 rounded-md bg-muted animate-pulse shrink-0" />
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border overflow-hidden">
              <div className="h-1 w-full bg-muted animate-pulse" />
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="h-5 w-40 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="h-8 w-20 rounded-md bg-muted animate-pulse" />
                </div>
                <div className="flex gap-4">
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
