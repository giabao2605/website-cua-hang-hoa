import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) return null;
  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function createConfirmedSupabaseUser(input: { email: string; password: string; fullName: string; emailConfirm: true }) {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase admin is not configured.");
  const { error } = await client.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: input.emailConfirm,
    user_metadata: { full_name: input.fullName },
  });
  if (!error) return;
  if (/already (?:been )?registered|already exists|duplicate/i.test(error.message)) throw new Error("account_exists");
  throw new Error("Supabase user creation failed.");
}
