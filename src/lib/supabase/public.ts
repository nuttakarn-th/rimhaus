import { createClient } from "@supabase/supabase-js"

// No cookies — allows ISR caching on public routes
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
