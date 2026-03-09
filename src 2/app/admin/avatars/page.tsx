import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAvatars } from "@/lib/data";
import type { Avatar } from "@/lib/types";
import AdminAvatarsContent from "@/components/AdminAvatarsContent";

export const dynamic = "force-dynamic";

export default async function AvatarsPage() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    redirect("/");
  }

  const avatars = await getAvatars();

  const grouped: Record<string, Avatar[]> = avatars.reduce((acc, avatar) => {
    const category = avatar.category || "player";
    if (!acc[category]) acc[category] = [];
    acc[category].push(avatar);
    return acc;
  }, {} as Record<string, Avatar[]>);

  return <AdminAvatarsContent avatars={avatars} grouped={grouped} />;
}
