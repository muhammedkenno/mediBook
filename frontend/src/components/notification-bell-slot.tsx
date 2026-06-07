import { createServerSupabaseClient } from "@/lib/supabase-server"
import { NotificationBell, type NotificationRow } from "./notification-bell"

/**
 * Server component: checks auth, fetches the latest notifications, then hands
 * off to the client component which subscribes to Realtime for live updates.
 * Renders nothing if the user isn't signed in.
 */
export async function NotificationBellSlot() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, read_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  return <NotificationBell userId={user.id} initialItems={(data ?? []) as NotificationRow[]} />
}
