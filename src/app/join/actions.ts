"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type JoinState = { ok: boolean; message: string };

export async function joinTournament(
  _prevState: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const nameRaw = String(formData.get("name") ?? "").trim();
  if (!nameRaw) {
    return { ok: false, message: "الاسم مطلوب" };
  }

  const supabase = await createClient();
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id, status, allow_public_registration")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!tournament) {
    return { ok: false, message: "لا توجد بطولة حالياً" };
  }

  if (
    tournament.status !== "registration_open" ||
    !tournament.allow_public_registration
  ) {
    return { ok: false, message: "التسجيل العام غير متاح" };
  }

  const { data: existing } = await supabase
    .from("participants")
    .select("id")
    .eq("tournament_id", tournament.id)
    .ilike("name", nameRaw)
    .maybeSingle();

  if (existing) {
    return { ok: false, message: "الاسم مسجل مسبقاً" };
  }

  const { error } = await supabase.from("participants").insert({
    tournament_id: tournament.id,
    name: nameRaw,
  });

  if (error) {
    return { ok: false, message: "تعذر التسجيل حالياً" };
  }

  revalidatePath("/participants");
  return { ok: true, message: "تم التسجيل بنجاح" };
}
