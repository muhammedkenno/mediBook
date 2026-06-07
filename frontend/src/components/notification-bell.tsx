"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Bell, CheckCheck } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

export interface NotificationRow {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read_at: string | null
  created_at: string
}

export function NotificationBell({
  userId,
  initialItems,
}: {
  userId: string
  initialItems: NotificationRow[]
}) {
  const t = useTranslations("notifications")
  const [items, setItems] = useState<NotificationRow[]>(initialItems)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  // Unique per mount — prevents "cannot add callbacks after subscribe()" when
  // React 18 Strict Mode double-invokes effects and the first channel teardown
  // hasn't fully completed before the second subscription attempt.
  const channelName = useRef(`notifications:${userId}:${Math.random()}`)

  const unread = items.filter((n) => !n.read_at).length

  // Realtime subscription: new INSERTs prepend; UPDATEs (mark-read) replace.
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(channelName.current)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => setItems((prev) => [payload.new as NotificationRow, ...prev].slice(0, 10)),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => setItems((prev) =>
          prev.map((n) => (n.id === (payload.new as NotificationRow).id ? (payload.new as NotificationRow) : n)),
        ),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  async function markAllRead() {
    const supabase = createClient()
    const unreadIds = items.filter((n) => !n.read_at).map((n) => n.id)
    if (unreadIds.length === 0) return
    const now = new Date().toISOString()
    // Optimistic update — Realtime will echo the changes anyway
    setItems((prev) => prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read_at: now } : n)))
    await supabase.from("notifications").update({ read_at: now }).in("id", unreadIds)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("title")}
        className="relative inline-flex size-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -end-1 grid min-w-[18px] h-[18px] place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-80 rounded-xl border bg-popover text-popover-foreground shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <p className="font-semibold text-sm">{t("title")}</p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <CheckCheck className="size-3" />
                {t("markAllRead")}
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 ${n.read_at ? "opacity-70" : "bg-muted/30"}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read_at && (
                      <span className="mt-1.5 inline-block size-2 rounded-full bg-primary shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{n.body}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {timeAgo(n.created_at, t)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function timeAgo(
  iso: string,
  t: (key: string, vars?: Record<string, string | number | Date>) => string,
): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return t("justNow")
  if (mins < 60) return t("minutesAgo", { n: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t("hoursAgo", { n: hours })
  return t("daysAgo", { n: Math.floor(hours / 24) })
}
