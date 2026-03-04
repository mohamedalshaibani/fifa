'use client';

import { useState, useTransition } from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import SportButton from '@/components/ui/SportButton';

interface MatchScoreEditorProps {
  matchId: string;
  tournamentId: string;
  round: number;
  homeName: string | null;
  awayName: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  onUpdateScore: (formData: FormData) => Promise<void>;
  /** Team members for home team (for 2v2 display) */
  homeMembers?: string[];
  /** Team members for away team (for 2v2 display) */
  awayMembers?: string[];
}

export default function MatchScoreEditor({
  matchId,
  tournamentId,
  round,
  homeName,
  awayName,
  homeScore,
  awayScore,
  status,
  onUpdateScore,
  homeMembers = [],
  awayMembers = [],
}: MatchScoreEditorProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [home, setHome] = useState<string>(homeScore?.toString() ?? '');
  const [away, setAway] = useState<string>(awayScore?.toString() ?? '');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isTeamMatch = homeMembers.length > 0 || awayMembers.length > 0;

  const handleSave = () => {
    setError(null);
    
    const homeNum = parseInt(home, 10);
    const awayNum = parseInt(away, 10);
    
    if (home !== '' && isNaN(homeNum)) {
      setError(t('matchEditor.mustBeNumber'));
      return;
    }
    if (away !== '' && isNaN(awayNum)) {
      setError(t('matchEditor.mustBeNumber'));
      return;
    }
    if (homeNum < 0 || awayNum < 0) {
      setError(t('matchEditor.cannotBeNegative'));
      return;
    }

    const formData = new FormData();
    formData.append('matchId', matchId);
    formData.append('tournamentId', tournamentId);
    formData.append('round', round.toString());
    formData.append('homeScore', home || '');
    formData.append('awayScore', away || '');

    startTransition(async () => {
      try {
        await onUpdateScore(formData);
        setIsEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('matchEditor.saveError'));
      }
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setHome(homeScore?.toString() ?? '');
    setAway(awayScore?.toString() ?? '');
    setError(null);
  };

  if (!isEditing) {
    return (
      <div className="p-4 rounded-lg bg-surface hover:bg-surface-alt transition-colors group">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex-1 text-right">
            <div className="font-bold text-foreground">{homeName || "TBD"}</div>
            {isTeamMatch && homeMembers.length > 0 && (
              <div className="text-xs text-muted mt-1">
                {homeMembers.join(" • ")}
              </div>
            )}
          </div>

          {/* Score / VS */}
          <div className="mx-4 flex flex-col items-center">
            {status === "completed" ? (
              <span className="font-black text-xl text-primary px-4 py-1 bg-primary/10 rounded-lg">
                {homeScore ?? 0} - {awayScore ?? 0}
              </span>
            ) : (
              <span className="text-muted font-bold px-4">vs</span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 text-left">
            <div className="font-bold text-foreground">{awayName || "TBD"}</div>
            {isTeamMatch && awayMembers.length > 0 && (
              <div className="text-xs text-muted mt-1">
                {awayMembers.join(" • ")}
              </div>
            )}
          </div>

          {/* Status & Edit */}
          <div className="flex items-center gap-2 mr-4">
            <span className={`text-xs px-2 py-1 rounded ${
              status === "completed" ? "bg-success/20 text-success" : "bg-info/20 text-info"
            }`}>
              {status === "completed" ? t('matchEditor.completed') : t('matchEditor.pending')}
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title={t('matchEditor.editResult')}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-surface border-2 border-primary/50 space-y-3">
      <div className="flex items-center justify-center gap-3">
        {/* Home Team */}
        <div className="flex-1 text-right">
          <div className="font-bold text-foreground text-sm">{homeName || "TBD"}</div>
          {isTeamMatch && homeMembers.length > 0 && (
            <div className="text-xs text-muted mt-0.5">
              {homeMembers.join(" • ")}
            </div>
          )}
        </div>
        <input
          type="number"
          min="0"
          value={home}
          onChange={(e) => setHome(e.target.value)}
          className="w-16 h-10 text-center text-lg font-bold border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="0"
          disabled={isPending}
        />
        <span className="text-muted font-bold">:</span>
        <input
          type="number"
          min="0"
          value={away}
          onChange={(e) => setAway(e.target.value)}
          className="w-16 h-10 text-center text-lg font-bold border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="0"
          disabled={isPending}
        />
        {/* Away Team */}
        <div className="flex-1 text-left">
          <div className="font-bold text-foreground text-sm">{awayName || "TBD"}</div>
          {isTeamMatch && awayMembers.length > 0 && (
            <div className="text-xs text-muted mt-0.5">
              {awayMembers.join(" • ")}
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-danger text-center">{error}</p>
      )}
      
      <div className="flex justify-center gap-3">
        <SportButton
          variant="primary"
          size="base"
          icon={Check}
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? t('matchEditor.saving') : t('matchEditor.save')}
        </SportButton>
        <SportButton
          variant="outline"
          size="base"
          icon={X}
          onClick={handleCancel}
          disabled={isPending}
        >
          {t('matchEditor.cancel')}
        </SportButton>
      </div>
    </div>
  );
}
