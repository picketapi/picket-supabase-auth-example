import { createClient, SupabaseClientOptions } from "@supabase/supabase-js";

export const cookieName = "sb-access-token";

const getSupabase = (accessToken: string) => {
  const options: SupabaseClientOptions<"public"> = {};

  if (accessToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options
  );

  return supabase;
};

export { getSupabase };
