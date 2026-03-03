import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

interface CookieToSet {
  name: string;
  value: string;
  options?: Record<string, unknown>;
}

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll can fail in Server Components where cookies are read-only
          // This is expected behavior and the refresh will be handled on subsequent requests
        }
      },
    },
  });
}
