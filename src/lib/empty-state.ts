/**
 * Empty state helper functions for tournament details page
 * Provides user-friendly fallback messages when data is missing
 */

export const getEmptyStateText = (fieldType: 'description' | 'champion' | 'generic'): string => {
  switch (fieldType) {
    case 'description':
      return 'لا يوجد وصف لهذه البطولة بعد';
    case 'champion':
      return 'لم يتم تحديد بطل البطولة بعد';
    default:
      return 'غير متوفر حالياً';
  }
};

export interface TournamentSetupStatus {
  isIncomplete: boolean;
  missingFields: string[];
  setupMessage: string;
}

/**
 * Check if a tournament is missing required setup fields
 * Required fields: format (type), start_date, team_mode (players_per_team)
 */
export function checkTournamentSetupStatus(tournament: {
  type?: string | null;
  start_date?: string | null;
  players_per_team?: number;
}): TournamentSetupStatus {
  const missingFields: string[] = [];

  if (!tournament.type) {
    missingFields.push('format');
  }
  
  if (!tournament.start_date) {
    missingFields.push('start_date');
  }

  // players_per_team is always set (defaults to 1), so we don't check it

  const isIncomplete = missingFields.length > 0;

  return {
    isIncomplete,
    missingFields,
    setupMessage: isIncomplete
      ? 'هذه البطولة قيد الإعداد — سيتم إكمال التفاصيل قريباً'
      : '',
  };
}

/**
 * Format a null/undefined value with appropriate fallback
 */
export function formatValue<T>(
  value: T | null | undefined,
  fallback: string = getEmptyStateText('generic')
): string | T {
  if (value === null || value === undefined) {
    return fallback;
  }
  return value;
}

/**
 * Safe numeric value for stats (never show empty, always show 0)
 */
export function formatNumber(value: number | null | undefined): number {
  return value ?? 0;
}
