"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import TeammateSearch from "@/components/TeammateSearch";
import { UserProfile } from "@/lib/types";

interface TournamentRegistrationFormProps {
  tournamentId: string;
  tournamentSlug: string;
  tournamentName: string;
  playersPerTeam: number;
  userId: string;
}

export default function TournamentRegistrationForm({
  tournamentId,
  tournamentSlug,
  tournamentName,
  playersPerTeam,
  userId,
}: TournamentRegistrationFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [notes, setNotes] = useState("");
  const [teammateId, setTeammateId] = useState<string>("");
  const [teammateProfile, setTeammateProfile] = useState<UserProfile | null>(null);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const is1v1 = playersPerTeam === 1;
  const is2v2 = playersPerTeam === 2;
  const isSubmitted = Boolean(success);

  const formatError = (err: any) => {
    if (!err) return "";
    const parts = [err.message, err.details, err.hint, err.code].filter(Boolean);
    return parts.join(" | ");
  };

  const handleTeammateSelected = (userId: string, profile: UserProfile | null) => {
    setTeammateId(userId);
    setTeammateProfile(profile);
    
    // Auto-generate team name if not set
    if (!teamName && profile) {
      // Will be set when user profile is loaded
      supabase.from("user_profiles").select("first_name, last_name").eq("id", userId).single()
        .then(({ data: myProfile }) => {
          if (myProfile && profile) {
            setTeamName(`${myProfile.first_name} & ${profile.first_name}`);
          }
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation for 2v2
    if (is2v2 && !teammateId) {
      setError("يرجى اختيار زميل للفريق أولاً");
      return;
    }

    setLoading(true);

    try {
      // Get user profile for name
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, email")
        .eq("id", userId)
        .single();

      if (profileError) {
        setError(formatError(profileError) || "تعذر تحميل ملفك الشخصي. حاول مرة أخرى.");
        return;
      }

      if (!profile) {
        setError("تعذر تحميل ملفك الشخصي. حاول مرة أخرى.");
        return;
      }

      const fullName = `${profile.first_name} ${profile.last_name}`;

      if (is1v1) {
        // Simple 1v1 registration - just create participant
        const { error: participantError } = await supabase
          .from("participants")
          .insert([
            {
              tournament_id: tournamentId,
              user_id: userId,
              name: fullName,
              email: profile.email,
              notes: notes || null,
              registration_status: "pending",
            },
          ]);

        if (participantError) {
          if (participantError.code === "23505") {
            setError("تم التسجيل مسبقاً في هذه البطولة.");
          } else {
            setError(formatError(participantError) || "فشل التسجيل. حاول مرة أخرى.");
          }
          return;
        }
      } else if (is2v2) {
        // 2v2 registration - create team first, then send invitation
        
        // 1. Create team
        const { data: team, error: teamError } = await supabase
          .from("teams")
          .insert([
            {
              tournament_id: tournamentId,
              created_by: userId,
              name: teamName || `${fullName} Team`,
              status: "pending", // Will be confirmed when teammate accepts
            },
          ])
          .select()
          .single();

        if (teamError) {
          setError(formatError(teamError) || "تعذر إنشاء الفريق. حاول مرة أخرى.");
          return;
        }

        // 2. Add creator as first team member
        const { error: memberError } = await supabase
          .from("team_members")
          .insert([
            {
              team_id: team.id,
              user_id: userId,
              role: "creator",
              status: "confirmed",
            },
          ]);

        if (memberError) {
          setError(formatError(memberError) || "تعذر إضافة حسابك للفريق.");
          return;
        }

        // 3. Send invitation to teammate
        const { error: inviteError } = await supabase
          .from("team_invitations")
          .insert([
            {
              team_id: team.id,
              tournament_id: tournamentId,
              inviter_id: userId,
              invitee_id: teammateId,
              status: "pending",
            },
          ]);

        if (inviteError) {
          if (inviteError.code === "23505") {
            setError("تمت دعوة هذا المستخدم مسبقاً لنفس الفريق.");
          } else {
            setError(formatError(inviteError) || "تعذر إرسال الدعوة.");
          }
          return;
        }

        // 4. Create participant for creator (pending approval)
        const { error: participantError } = await supabase
          .from("participants")
          .insert([
            {
              tournament_id: tournamentId,
              user_id: userId,
              team_id: team.id,
              name: fullName,
              email: profile.email,
              notes: notes || null,
              registration_status: "pending",
            },
          ]);

        if (participantError) {
          setError(formatError(participantError) || "تعذر إكمال التسجيل في البطولة.");
          return;
        }
      }

      const successMessage = is2v2
        ? "تم إنشاء الفريق وإرسال الدعوة بنجاح. سيتم تحويلك الآن."
        : "تم إرسال طلب التسجيل بنجاح. سيتم تحويلك الآن.";

      setSuccess(successMessage);

      const nextUrl = is2v2
        ? `/t/${tournamentSlug}?registered=team`
        : `/t/${tournamentSlug}?registered=solo`;

      setTimeout(() => {
        router.push(nextUrl);
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "تعذر إكمال التسجيل.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg text-12">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-lg text-12">
          {success}
        </div>
      )}

      {/* Tournament Format Info */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="text-12 font-semibold text-primary mb-2">
          {is1v1 ? "1v1 Individual Tournament" : "2v2 Team Tournament"}
        </p>
        <p className="text-10 text-muted">
          {is1v1
            ? "You will compete individually against other players."
            : "You need to form a team with another registered user. An invitation will be sent to your teammate for confirmation."}
        </p>
      </div>

      {/* 2v2 Teammate Selection */}
      {is2v2 && (
        <div>
          <TeammateSearch
            tournamentId={tournamentId}
            currentUserId={userId}
            onTeammateSelected={handleTeammateSelected}
            selectedTeammateId={teammateId}
          />

          {/* Optional Team Name */}
          {teammateProfile && (
            <div className="mt-4">
              <Input
                label="Team Name (Optional)"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder={`${teammateProfile.first_name} & You`}
                disabled={loading}
              />
            </div>
          )}
        </div>
      )}

      {/* Optional Notes */}
      <div>
        <label className="block text-12 font-semibold text-foreground mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requests or notes for the organizer..."
          disabled={loading || isSubmitted}
          className="w-full p-3 border border-border rounded-lg text-12 focus:outline-none focus:ring-2 focus:ring-primary/50"
          rows={3}
        />
      </div>

      {/* Submit Info */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-12 text-foreground">
        <p className="font-medium mb-2">📋 What happens next?</p>
        <ul className="list-disc list-inside space-y-1">
          {is1v1 ? (
            <>
              <li>Your registration will be pending admin approval</li>
              <li>You'll be notified once approved or rejected</li>
              <li>Once approved, you can view the tournament schedule</li>
            </>
          ) : (
            <>
              <li>An invitation will be sent to your teammate</li>
              <li>Your teammate must accept the invitation</li>
              <li>Once accepted, your team will be pending admin approval</li>
              <li>Both players will be notified upon approval</li>
            </>
          )}
        </ul>
      </div>

      <Button
        type="submit"
        variant="primary"
        isLoading={loading}
        disabled={isSubmitted || (is2v2 && !teammateId)}
        className="w-full"
      >
        {isSubmitted
          ? "تم إرسال الطلب"
          : is1v1
            ? "إرسال طلب التسجيل"
            : "إنشاء فريق وإرسال الدعوة"}
      </Button>
    </form>
  );
}
