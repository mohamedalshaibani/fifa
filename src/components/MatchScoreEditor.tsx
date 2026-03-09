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
  homeYellowCards?: number;
  homeRedCards?: number;
  awayYellowCards?: number;
  awayRedCards?: number;
  status: string;
  onUpdateScore: (formData: FormData) => Promise<void>;
  /** Team members for home team (for 2v2 display) */
  homeMembers?: string[];
  /** Team members for away team (for 2v2 display) */
  awayMembers?: string[];
  /** Hide the round label (used when grouping by knockout stages) */
  hideRound?: boolean;
}

export default function MatchScoreEditor({
  matchId,
  tournamentId,
  round,
  homeName,
  awayName,
  homeScore,
  awayScore,
  homeYellowCards = 0,
  homeRedCards = 0,
  awayYellowCards = 0,
  awayRedCards = 0,
  status,
  onUpdateScore,
  homeMembers = [],
  awayMembers = [],
  hideRound = false,
}: MatchScoreEditorProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [home, setHome] = useState<string>(homeScore?.toString() ?? '');
  const [away, setAway] = useState<string>(awayScore?.toString() ?? '');
  // Card states - show empty instead of 0 for cleaner UX
  const [homeYellow, setHomeYellow] = useState<string>(homeYellowCards > 0 ? homeYellowCards.toString() : '');
  const [homeRed, setHomeRed] = useState<string>(homeRedCards > 0 ? homeRedCards.toString() : '');
  const [awayYellow, setAwayYellow] = useState<string>(awayYellowCards > 0 ? awayYellowCards.toString() : '');
  const [awayRed, setAwayRed] = useState<string>(awayRedCards > 0 ? awayRedCards.toString() : '');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isTeamMatch = homeMembers.length > 0 || awayMembers.length > 0;

  const handleSave = () => {
    setError(null);
    
    const homeNum = parseInt(home, 10);
    const awayNum = parseInt(away, 10);
    const homeYellowNum = parseInt(homeYellow, 10) || 0;
    const homeRedNum = parseInt(homeRed, 10) || 0;
    const awayYellowNum = parseInt(awayYellow, 10) || 0;
    const awayRedNum = parseInt(awayRed, 10) || 0;
    
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
    if (homeYellowNum < 0 || homeRedNum < 0 || awayYellowNum < 0 || awayRedNum < 0) {
      setError(t('matchEditor.cardsCannotBeNegative'));
      return;
    }

    const formData = new FormData();
    formData.append('matchId', matchId);
    formData.append('tournamentId', tournamentId);
    formData.append('round', round.toString());
    formData.append('homeScore', home || '');
    formData.append('awayScore', away || '');
    formData.append('homeYellowCards', homeYellowNum.toString());
    formData.append('homeRedCards', homeRedNum.toString());
    formData.append('awayYellowCards', awayYellowNum.toString());
    formData.append('awayRedCards', awayRedNum.toString());

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
    setHomeYellow(homeYellowCards > 0 ? homeYellowCards.toString() : '');
    setHomeRed(homeRedCards > 0 ? homeRedCards.toString() : '');
    setAwayYellow(awayYellowCards > 0 ? awayYellowCards.toString() : '');
    setAwayRed(awayRedCards > 0 ? awayRedCards.toString() : '');
    setError(null);
  };

  // Check if this is a bye match (no opponent)
  const isByeMatch = !awayName && status === "completed";

  if (!isEditing) {
    // Special display for bye matches
    if (isByeMatch) {
      return (
        <div className="p-4 rounded-lg bg-success/5 border border-success/20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-bold text-foreground">{homeName || "TBD"}</div>
              {isTeamMatch && homeMembers.length > 0 && (
                <div className="text-xs text-muted mt-1">
                  {homeMembers.join(" • ")}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-full bg-success/20 text-success font-semibold">
                ✓ {t('matchEditor.byeAdvance')}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-3 sm:p-4 rounded-lg bg-surface hover:bg-surface-alt transition-colors group">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between flex-1 gap-2 sm:gap-4">
            {/* Home Team */}
            <div className="flex-1 text-right min-w-0">
              <div className="font-bold text-foreground text-sm sm:text-base truncate">{homeName || "TBD"}</div>
              {isTeamMatch && homeMembers.length > 0 && (
                <div className="text-xs text-muted mt-1 truncate">
                  {homeMembers.join(" • ")}
                </div>
              )}
              {/* Home Cards Display */}
              {status === "completed" && (homeYellowCards > 0 || homeRedCards > 0) && (
                <div className="flex items-center justify-end gap-1 mt-1">
                  {homeYellowCards > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-600 font-bold">
                      🟨 {homeYellowCards}
                    </span>
                  )}
                  {homeRedCards > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-600 font-bold">
                      🟥 {homeRedCards}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Score / VS */}
            <div className="flex flex-col items-center flex-shrink-0 px-2">
              {status === "completed" ? (
                <span className="font-black text-lg sm:text-xl text-primary px-3 sm:px-4 py-1 bg-primary/10 rounded-lg">
                  {homeScore ?? 0} - {awayScore ?? 0}
                </span>
              ) : (
                <span className="text-muted font-bold px-3 sm:px-4">vs</span>
              )}
            </div>

            {/* Away Team */}
            <div className="flex-1 text-left min-w-0">
              <div className="font-bold text-foreground text-sm sm:text-base truncate">{awayName || "TBD"}</div>
              {isTeamMatch && awayMembers.length > 0 && (
                <div className="text-xs text-muted mt-1 truncate">
                  {awayMembers.join(" • ")}
                </div>
              )}
              {/* Away Cards Display */}
              {status === "completed" && (awayYellowCards > 0 || awayRedCards > 0) && (
                <div className="flex items-center justify-start gap-1 mt-1">
                  {awayYellowCards > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-600 font-bold">
                      🟨 {awayYellowCards}
                    </span>
                  )}
                  {awayRedCards > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-600 font-bold">
                      🟥 {awayRedCards}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status & Edit */}
          <div className="flex items-center justify-end gap-2 flex-shrink-0">
            <span className={`text-xs px-2 py-1 rounded ${
              status === "completed" ? "bg-success/20 text-success" : "bg-info/20 text-info"
            }`}>
              {status === "completed" ? t('matchEditor.completed') : t('matchEditor.pending')}
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              title={t('matchEditor.editResult')}
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">{status === 'completed' ? t('matchEditor.edit') : t('matchEditor.addResult')}</span>
              <span className="sm:hidden">{status === 'completed' ? t('matchEditor.edit') : t('matchEditor.add')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 rounded-lg bg-surface border-2 border-primary/50 space-y-4">
      {/* Score Section */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
        {/* Home Team */}
        <div className="flex-1 text-right hidden sm:block">
          <div className="font-bold text-foreground text-sm">{homeName || "TBD"}</div>
          {isTeamMatch && homeMembers.length > 0 && (
            <div className="text-xs text-muted mt-0.5">
              {homeMembers.join(" • ")}
            </div>
          )}
        </div>
        
        {/* Mobile team names */}
        <div className="flex sm:hidden w-full justify-between px-2 mb-2">
          <span className="text-sm font-bold text-foreground">{homeName || "TBD"}</span>
          <span className="text-sm font-bold text-foreground">{awayName || "TBD"}</span>
        </div>
        
        {/* Score inputs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <input
            type="number"
            min="0"
            value={home}
            onChange={(e) => setHome(e.target.value)}
            className="w-14 sm:w-16 h-10 text-center text-lg font-bold border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="0"
            disabled={isPending}
          />
          <span className="text-muted font-bold">:</span>
          <input
            type="number"
            min="0"
            value={away}
            onChange={(e) => setAway(e.target.value)}
            className="w-14 sm:w-16 h-10 text-center text-lg font-bold border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="0"
            disabled={isPending}
          />
        </div>
        
        {/* Away Team */}
        <div className="flex-1 text-left hidden sm:block">
          <div className="font-bold text-foreground text-sm">{awayName || "TBD"}</div>
          {isTeamMatch && awayMembers.length > 0 && (
            <div className="text-xs text-muted mt-0.5">
              {awayMembers.join(" • ")}
            </div>
          )}
        </div>
      </div>
      
      {/* Cards Section */}
      <div className="border-t border-border/50 pt-4">
        <div className="text-xs font-bold text-muted text-center mb-3 uppercase tracking-wider">
          {t('matchEditor.disciplinaryCards')}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Home Cards */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-foreground text-center truncate">{homeName || "TBD"}</div>
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-sm">🟨</span>
                <input
                  type="number"
                  min="0"
                  value={homeYellow}
                  onChange={(e) => setHomeYellow(e.target.value)}
                  className="w-12 h-8 text-center text-sm font-bold border border-yellow-400/50 rounded bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="0"
                  disabled={isPending}
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm">🟥</span>
                <input
                  type="number"
                  min="0"
                  value={homeRed}
                  onChange={(e) => setHomeRed(e.target.value)}
                  className="w-12 h-8 text-center text-sm font-bold border border-red-400/50 rounded bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="0"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
          
          {/* Away Cards */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-foreground text-center truncate">{awayName || "TBD"}</div>
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-sm">🟨</span>
                <input
                  type="number"
                  min="0"
                  value={awayYellow}
                  onChange={(e) => setAwayYellow(e.target.value)}
                  className="w-12 h-8 text-center text-sm font-bold border border-yellow-400/50 rounded bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="0"
                  disabled={isPending}
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm">🟥</span>
                <input
                  type="number"
                  min="0"
                  value={awayRed}
                  onChange={(e) => setAwayRed(e.target.value)}
                  className="w-12 h-8 text-center text-sm font-bold border border-red-400/50 rounded bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="0"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-danger text-center">{error}</p>
      )}
      
      <div className="flex justify-center gap-3 pt-2">
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
