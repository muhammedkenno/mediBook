export default function DoctorsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-28 rounded bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded bg-muted animate-pulse" />
      </div>
      <div className="flex justify-end">
        <div className="h-9 w-36 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="rounded-xl border overflow-hidden">
        <div className="h-10 bg-muted/50 border-b" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 h-14 border-b last:border-0">
            <div className="h-4 w-36 rounded bg-muted animate-pulse" />
            <div className="h-5 w-28 rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-40 rounded bg-muted animate-pulse" />
            <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
            <div className="size-7 rounded-md bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
