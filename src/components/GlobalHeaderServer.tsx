import GlobalHeader from "@/components/GlobalHeader";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function GlobalHeaderServer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    isAdmin = !!data;
  }

  return (
    <GlobalHeader
      initialUser={
        user
          ? {
              id: user.id,
              email: user.email ?? null,
            }
          : null
      }
      initialIsAdmin={isAdmin}
    />
  );
}
