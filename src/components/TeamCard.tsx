import { EditTeamNameButton } from './EditTeamNameButton';
import Card from "@/components/Card";
import { User } from 'lucide-react';

interface TeamCardProps {
  teamId: string;
  tournamentId: string;
  teamName: string;
  members: string[];
  onUpdateName?: (formData: FormData) => Promise<void>;
  showEditButton?: boolean;
  compact?: boolean;
}

export function TeamCard({
  teamId,
  tournamentId,
  teamName,
  members,
  onUpdateName,
  showEditButton = false,
  compact = false,
}: TeamCardProps) {
  if (compact) {
    // Compact format: "برشلونة (محمد + سلطان)"
    const memberNames = members.length > 0 ? members.join(' + ') : '—';
    return (
      <span className="text-sm shadow-sm px-2 py-0.5 rounded bg-surface border border-border inline-flex items-center gap-1.5">
        <span className="font-bold text-foreground">{teamName}</span>
        <span className="text-muted text-xs">({memberNames})</span>
      </span>
    );
  }

  // Full card format
  return (
    <Card className="p-4 bg-white/80 backdrop-blur-md border-l-4 border-primary/70 shadow-md animate-fade-in" noPadding={false} hoverable>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
        <p className="font-bold text-foreground text-lg truncate flex-1" title={teamName}>{teamName}</p>
        {showEditButton && onUpdateName && (
          <EditTeamNameButton
            teamId={teamId}
            tournamentId={tournamentId}
            initialName={teamName}
            onUpdate={onUpdateName}
          />
        )}
      </div>
      <div className="space-y-2">
        {members.length > 0 ? (
          members.map((name, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-secondary p-1.5 rounded-full bg-surface-2/80 border border-border/40 shadow-sm">
              <span className="h-7 w-7 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-xs font-bold text-primary shadow animate-float">
                <User className="w-4 h-4" />
              </span>
              <span className="font-medium text-foreground">{name}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted flex items-center gap-1">
             <AlertCircle className="w-3 h-3" />
             لا يوجد أعضاء
          </p>
        )}
      </div>
    </Card>
  );
}

import { AlertCircle } from 'lucide-react';

// Match display component showing both teams with members
interface MatchTeamsDisplayProps {
  homeTeamId: string | null;
  awayTeamId: string | null;
  teamNameMap: Map<string, string>;
  teamMembersMap: Map<string, string[]>;
  homeScore?: number | null;
  awayScore?: number | null;
}

export function MatchTeamsDisplay({
  homeTeamId,
  awayTeamId,
  teamNameMap,
  teamMembersMap,
  homeScore,
  awayScore,
}: MatchTeamsDisplayProps) {
  const homeName = homeTeamId ? teamNameMap.get(homeTeamId) || '—' : '—';
  const awayName = awayTeamId ? teamNameMap.get(awayTeamId) || '—' : '—';
  const homeMembers = homeTeamId ? teamMembersMap.get(homeTeamId) || [] : [];
  const awayMembers = awayTeamId ? teamMembersMap.get(awayTeamId) || [] : [];

  return (
    <div className="flex items-stretch gap-4 bg-surface-2/30 rounded-lg p-3 border border-border/50">
      {/* Home Team */}
      <div className="flex-1 text-right flex flex-col justify-center">
        <p className="font-bold text-foreground text-sm sm:text-base leading-tight">{homeName}</p>
        <div className="text-xs text-muted mt-1 truncate" title={homeMembers.join(', ')}>
          {homeMembers.length > 0 ? homeMembers.join(' • ') : '—'}
        </div>
      </div>

      {/* Score */}
      <div className="text-center min-w-[80px] flex flex-col justify-center items-center px-2 bg-surface rounded border border-border/50">
        <div className="text-xl sm:text-2xl font-black text-primary font-mono tracking-wider">
           {homeScore ?? '-'} : {awayScore ?? '-'}
        </div>
      </div>

      {/* Away Team */}
      <div className="flex-1 text-left flex flex-col justify-center">
        <p className="font-bold text-foreground text-sm sm:text-base leading-tight">{awayName}</p>
        <div className="text-xs text-muted mt-1 truncate" title={awayMembers.join(', ')}>
          {awayMembers.length > 0 ? awayMembers.join(' • ') : '—'}
        </div>
      </div>
    </div>
  );
}
