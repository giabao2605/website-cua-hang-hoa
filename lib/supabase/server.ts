import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (values) => {
        try { values.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* Server components cannot always set refreshed cookies. */ }
      },
    },
  });
}

export async function getCurrentAuthUser() {
  const client = await createSupabaseServerClient();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  return user;
}
