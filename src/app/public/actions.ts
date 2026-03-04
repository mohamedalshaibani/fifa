"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";

/**
 * Register the logged-in user for a tournament.
 * No guest registration allowed - user must be authenticated.
 */
export async function registerAuthenticatedUser(formData: FormData) {
  const tournamentId = String(formData.get("tournamentId") ?? "").trim();
  const tournamentSlug = String(formData.get("tournamentSlug") ?? "").trim();

  // Get authenticated user
  const user = await getCurrentUser();
  
  if (!user) {
    redirect(`/t/${tournamentSlug}?error=auth`);
  }

  const supabase = createAdminClient();

  // Check tournament exists and is open
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id, status")
    .eq("id", tournamentId)
    .single();

  if (tournamentError || !tournament) {
    redirect(`/t/${tournamentSlug}?error=notfound`);
  }

  if (tournament.status !== "registration_open") {
    redirect(`/t/${tournamentSlug}?error=closed`);
  }

  // Check if already registered
  const { data: existing } = await supabase
    .from("participants")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    redirect(`/t/${tournamentSlug}?registered=already`);
  }

  // Insert participant linked to user
  const { error: insertError } = await supabase
    .from("participants")
    .insert({
      tournament_id: tournamentId,
      user_id: user.id,
      name: user.displayName,
      email: user.email,
      registration_status: "approved", // Auto-approve authenticated users
    });

  if (insertError) {
    console.error("[registerAuthenticatedUser] Insert error:", insertError);
    redirect(`/t/${tournamentSlug}?error=server`);
  }

  revalidatePath(`/t/${tournamentSlug}`);
  redirect(`/t/${tournamentSlug}?registered=success`);
}

export async function registerForTournament(formData: FormData) {
  const tournamentId = String(formData.get("tournamentId") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const tournamentSlug = String(formData.get("tournamentSlug") ?? "").trim();
  const isTeamBased = formData.get("isTeamBased") === "true";
  const teamFormationMode = String(formData.get("teamFormationMode") ?? "preformed");
  const isPreformedTeams = teamFormationMode === "preformed";

  // Get form data based on type and formation mode
  let name: string;
  let teamName: string | null = null;
  let player1Name: string | null = null;
  let player2Name: string | null = null;

  if (isTeamBased && isPreformedTeams) {
    // Pre-formed teams: need team name + 2 players
    teamName = String(formData.get("teamName") ?? "").trim();
    player1Name = String(formData.get("player1Name") ?? "").trim();
    player2Name = String(formData.get("player2Name") ?? "").trim();
    name = player1Name; // Primary participant is player 1
    
    if (!tournamentId || !teamName || !player1Name || !player2Name || !email) {
      if (tournamentSlug) redirect(`/t/${tournamentSlug}?requested=0&error=missing`);
      return;
    }
  } else {
    // Individual registration (1v1 or random draw 2v2)
    name = String(formData.get("name") ?? "").trim();
    
    if (!tournamentId || !name || !email) {
      if (tournamentSlug) redirect(`/t/${tournamentSlug}?requested=0&error=missing`);
      return;
    }
  }

  const supabase = createAdminClient();

  try {
    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .select("id, status, allow_public_registration")
      .eq("id", tournamentId)
      .single();

    if (tournamentError || !tournament) {
      console.error("[registerForTournament] Tournament lookup failed:", {
        error: tournamentError,
        tournamentId,
      });
      if (tournamentSlug) redirect(`/t/${tournamentSlug}?requested=0&error=notfound`);
      return;
    }

    if (tournament.status !== "registration_open") {
      console.warn("[registerForTournament] Registration closed:", {
        tournamentId,
        status: tournament.status,
      });
      if (tournamentSlug) redirect(`/t/${tournamentSlug}?requested=0&error=closed`);
      return;
    }

    if (!tournament.allow_public_registration) {
      console.warn("[registerForTournament] Public registration disabled:", {
        tournamentId,
        allow_public_registration: tournament.allow_public_registration,
      });
      if (tournamentSlug) redirect(`/t/${tournamentSlug}?requested=0&error=disabled`);
      return;
    }

    const { data: existing, error: existingError } = await supabase
      .from("participants")
      .select("id, registration_status")
      .eq("tournament_id", tournamentId)
      .ilike("email", email)
      .maybeSingle();

    if (existingError) {
      const errorCode = existingError.code === "42703" || existingError.code === "PGRST204"
        ? "migration"
        : "server";
      if (tournamentSlug) {
        redirect(`/t/${tournamentSlug}?requested=0&error=${errorCode}`);
      }
      return;
    }

    if (existing?.registration_status === "approved") {
      if (tournamentSlug) redirect(`/t/${tournamentSlug}?requested=1`);
      return;
    }

    if (existing?.registration_status === "pending") {
      if (tournamentSlug) redirect(`/t/${tournamentSlug}?requested=1`);
      return;
    }

    if (isTeamBased && teamName && player1Name && player2Name) {
      // TEAM REGISTRATION: Create team + add members as participants
      
      // Step 1: Create the team record
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .insert({
          tournament_id: tournamentId,
          name: teamName,
          created_by: null, // NULL for public registrations (no auth yet)
          status: "pending",
        })
        .select("id")
        .single();

      if (teamError || !teamData) {
        console.error("[registerForTournament] Team creation failed:", {
          error: teamError,
          code: teamError?.code,
          message: teamError?.message,
          tournamentId,
          teamName,
        });
        if (tournamentSlug) {
          const errorCode = teamError?.code === "42703" || teamError?.code === "PGRST204" ? "migration" : "server";
          redirect(`/t/${tournamentSlug}?requested=0&error=${errorCode}`);
        }
        return;
      }

      const teamId = teamData.id;

      // Step 2: Create participant records for both players and link to team
      const { data: player1Data, error: error1 } = await supabase
        .from("participants")
        .insert({
          tournament_id: tournamentId,
          name: player1Name,
          email,
          registration_status: "pending",
          team_id: teamId,
        })
        .select("id")
        .single();

      if (error1 || !player1Data) {
        console.error("[registerForTournament] Player 1 insert failed:", {
          error: error1,
          code: error1?.code,
          message: error1?.message,
          tournamentId,
          teamId,
          teamName,
          player1Name,
        });
        // Clean up: delete the team we just created
        await supabase.from("teams").delete().eq("id", teamId);
        if (tournamentSlug) {
          const errorCode = error1?.code === "42703" || error1?.code === "PGRST204" ? "migration" : "server";
          redirect(`/t/${tournamentSlug}?requested=0&error=${errorCode}`);
        }
        return;
      }

      const { data: player2Data, error: error2 } = await supabase
        .from("participants")
        .insert({
          tournament_id: tournamentId,
          name: player2Name,
          email,
          registration_status: "pending",
          team_id: teamId,
        })
        .select("id")
        .single();

      if (error2 || !player2Data) {
        console.error("[registerForTournament] Player 2 insert failed:", {
          error: error2,
          code: error2?.code,
          message: error2?.message,
          tournamentId,
          teamId,
          teamName,
          player2Name,
        });
        // Clean up: delete the team and player 1
        await supabase.from("teams").delete().eq("id", teamId);
        if (tournamentSlug) {
          const errorCode = error2?.code === "42703" || error2?.code === "PGRST204" ? "migration" : "server";
          redirect(`/t/${tournamentSlug}?requested=0&error=${errorCode}`);
        }
        return;
      }
    } else {
      // Individual registration
      const { error } = await supabase.from("participants").insert({
        tournament_id: tournamentId,
        name,
        email,
        registration_status: "pending",
      });

      if (error) {
        console.error("[registerForTournament] Insert failed:", {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          tournamentId,
          name,
          email,
        });
        if (tournamentSlug) {
          const errorCode = error.code === "42703" || error.code === "PGRST204" ? "migration" : "server";
          redirect(`/t/${tournamentSlug}?requested=0&error=${errorCode}`);
        }
        return;
      }
    }

    revalidatePath("/t");
    revalidatePath("/tournaments");
    revalidatePath("/");

    if (tournamentSlug) {
      redirect(`/t/${tournamentSlug}?requested=1`);
    }
  } catch (error) {
    // Next.js redirects throw errors - don't catch them as failures
    if (error instanceof Error && error.message?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("[registerForTournament] Unexpected error:", error);
    if (tournamentSlug) {
      redirect(`/t/${tournamentSlug}?requested=0&error=server`);
    }
  }
}
