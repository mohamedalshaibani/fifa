import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/data";

// Cache leaderboard data for 60 seconds
export const revalidate = 60;

export async function GET() {
  try {
    const leaderboard = await getLeaderboard();
    
    // Add cache headers for client-side caching
    return NextResponse.json(leaderboard, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error("[API /leaderboard] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
