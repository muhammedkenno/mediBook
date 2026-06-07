export default function ProfileLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-16 border-b bg-background/70" />
      <div className="flex-1 px-4 py-12 max-w-2xl mx-auto w-full">
        <div className="flex flex-col gap-2 mb-8">
          <div className="h-7 w-36 rounded bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
        </div>
        <div className="flex flex-col gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border p-6 flex flex-col gap-4">
              <div className="h-5 w-48 rounded bg-muted animate-pulse" />
              <div className="flex flex-col gap-3">
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
              </div>
              <div className="flex justify-end">
                <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
