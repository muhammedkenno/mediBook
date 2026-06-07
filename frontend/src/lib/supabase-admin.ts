import "server-only"
import { createClient } from "@supabase/supabase-js"

/**
 * Service-role client — bypasses Row Level Security. NEVER import this from a
 * client component. Use only inside server actions / route handlers AFTER you
 * have verified the caller is authorised (e.g. confirmed admin role).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
