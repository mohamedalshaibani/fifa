import { NextResponse } from "next/server";
import { getPlayerProfileById } from "@/lib/data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const playerId = resolvedParams.id;

    if (!playerId) {
      return NextResponse.json({ error: "Player ID required" }, { status: 400 });
    }

    const playerData = await getPlayerProfileById(playerId);

    if (!playerData) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(playerData);
  } catch (error) {
    console.error("[API /player/[id]] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
