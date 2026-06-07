export function DoctorGridSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-9 w-full max-w-sm rounded-md bg-muted animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-6 flex flex-col gap-3">
            <div className="h-5 w-2/3 rounded bg-muted animate-pulse" />
            <div className="h-5 w-24 rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-full rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
            <div className="h-8 w-full rounded-md bg-muted animate-pulse mt-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
