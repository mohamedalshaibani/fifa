import { Match, Participant, Team } from "./types";

// Minimal type for schedule generation - only needs id
export type MinimalParticipant = { id: string };

/**
 * Groups matches by round number.
 * Used by schedule, bracket, and tournament pages.
 */
export function groupMatchesByRound(matches: Match[]): Record<string, Match[]> {
  return matches.reduce<Record<string, Match[]>>((acc, match) => {
    const key = String(match.round);
    acc[key] = acc[key] ?? [];
    acc[key].push(match);
    return acc;
  }, {});
}

export type StandingRow = {
  participant: Participant;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
};

export function computeStandings(
  participants: Participant[],
  matches: Match[],
): StandingRow[] {
  const table = new Map<string, StandingRow>();

  for (const participant of participants) {
    table.set(participant.id, {
      participant,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (
      match.home_score === null ||
      match.away_score === null ||
      !match.home_participant_id ||
      !match.away_participant_id
    ) {
      continue;
    }

    const home = table.get(match.home_participant_id);
    const away = table.get(match.away_participant_id);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;

    home.goalsFor += match.home_score;
    home.goalsAgainst += match.away_score;
    away.goalsFor += match.away_score;
    away.goalsAgainst += match.home_score;

    if (match.home_score > match.away_score) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (match.home_score < match.away_score) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  for (const row of table.values()) {
    row.goalDiff = row.goalsFor - row.goalsAgainst;
  }

  return Array.from(table.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });
}

// Team-based standings for 2v2 leagues
export type TeamStandingRow = {
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
};

export function computeTeamStandings(
  teams: Team[],
  matches: Match[],
): TeamStandingRow[] {
  const table = new Map<string, TeamStandingRow>();

  for (const team of teams) {
    table.set(team.id, {
      team,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (
      match.home_score === null ||
      match.away_score === null ||
      !match.home_team_id ||
      !match.away_team_id
    ) {
      continue;
    }

    const home = table.get(match.home_team_id);
    const away = table.get(match.away_team_id);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;

    home.goalsFor += match.home_score;
    home.goalsAgainst += match.away_score;
    away.goalsFor += match.away_score;
    away.goalsAgainst += match.home_score;

    if (match.home_score > match.away_score) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (match.home_score < match.away_score) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  for (const row of table.values()) {
    row.goalDiff = row.goalsFor - row.goalsAgainst;
  }

  return Array.from(table.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });
}

export type ScheduledMatch = {
  round: number;
  homeParticipantId: string | null;
  awayParticipantId: string | null;
};

export function generateLeagueSchedule(participants: MinimalParticipant[]): ScheduledMatch[] {
  if (participants.length === 0) return [];
  const list: MinimalParticipant[] = [...participants];

  if (list.length % 2 === 1) {
    list.push({ id: "BYE" });
  }

  const totalRounds = list.length - 1;
  const half = list.length / 2;
  const schedule: ScheduledMatch[] = [];

  const rotating = list.slice(1);
  const fixed = list[0];

  for (let round = 0; round < totalRounds; round += 1) {
    const left = [fixed, ...rotating.slice(0, half - 1)];
    const right = rotating.slice(half - 1).reverse();

    for (let i = 0; i < half; i += 1) {
      const home = left[i];
      const away = right[i];
      if (home.id === "BYE" || away.id === "BYE") continue;
      schedule.push({
        round: round + 1,
        homeParticipantId: home.id,
        awayParticipantId: away.id,
      });
    }

    rotating.unshift(rotating.pop()!);
  }

  return schedule;
}

export function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function nextPowerOfTwo(value: number) {
  let power = 1;
  while (power < value) power *= 2;
  return power;
}

export function generateKnockoutRoundOne(participants: MinimalParticipant[]): ScheduledMatch[] {
  const shuffled = shuffle(participants);
  const target = nextPowerOfTwo(shuffled.length);
  const byes = target - shuffled.length;

  const matches: ScheduledMatch[] = [];
  const entrants = [...shuffled];

  for (let i = 0; i < byes; i += 1) {
    const participant = entrants.shift();
    if (!participant) break;
    matches.push({
      round: 1,
      homeParticipantId: participant.id,
      awayParticipantId: null,
    });
  }

  while (entrants.length >= 2) {
    const home = entrants.shift();
    const away = entrants.shift();
    if (!home || !away) break;
    matches.push({
      round: 1,
      homeParticipantId: home.id,
      awayParticipantId: away.id,
    });
  }

  return matches;
}

// ============================================================
// Team-based Tournament Utilities
// ============================================================

export type ScheduledTeamMatch = {
  round: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
};

export function generateLeagueScheduleTeams(teams: Team[]): ScheduledTeamMatch[] {
  if (teams.length === 0) return [];
  const list = [...teams];

  // Add BYE team if odd number
  if (list.length % 2 === 1) {
    list.push({
      id: "BYE",
      tournament_id: "",
      created_by: "BYE",
      status: "confirmed",
      name: "BYE",
      created_at: "",
      updated_at: "",
    });
  }

  const totalRounds = list.length - 1;
  const half = list.length / 2;
  const schedule: ScheduledTeamMatch[] = [];

  const rotating = list.slice(1);
  const fixed = list[0];

  for (let round = 0; round < totalRounds; round += 1) {
    const left = [fixed, ...rotating.slice(0, half - 1)];
    const right = rotating.slice(half - 1).reverse();

    for (let i = 0; i < half; i += 1) {
      const home = left[i];
      const away = right[i];
      if (home.id === "BYE" || away.id === "BYE") continue;
      schedule.push({
        round: round + 1,
        homeTeamId: home.id,
        awayTeamId: away.id,
      });
    }

    rotating.unshift(rotating.pop()!);
  }

  return schedule;
}

export function generateKnockoutRoundOneTeams(teams: Team[]): ScheduledTeamMatch[] {
  const shuffled = shuffle(teams);
  const target = nextPowerOfTwo(shuffled.length);
  const byes = target - shuffled.length;

  const matches: ScheduledTeamMatch[] = [];
  const entrants = [...shuffled];

  // BYE matches (auto-advance)
  for (let i = 0; i < byes; i += 1) {
    const team = entrants.shift();
    if (!team) break;
    matches.push({
      round: 1,
      homeTeamId: team.id,
      awayTeamId: null,
    });
  }

  // Regular matches
  while (entrants.length >= 2) {
    const home = entrants.shift();
    const away = entrants.shift();
    if (!home || !away) break;
    matches.push({
      round: 1,
      homeTeamId: home.id,
      awayTeamId: away.id,
    });
  }

  return matches;
}

// ============================================================
// Rest-Aware Match Scheduling
// ============================================================
// Ensures no team/participant plays in consecutive matches (where possible)

/**
 * Reorders matches so that no team appears in consecutive matches.
 * Uses a greedy algorithm: pick the next match where neither team 
 * played in the previous match.
 */
export function applyRestAwareOrderingTeams(matches: ScheduledTeamMatch[]): ScheduledTeamMatch[] {
  if (matches.length <= 1) return matches;

  const remaining = [...matches];
  const ordered: ScheduledTeamMatch[] = [];
  let lastTeamIds: Set<string> = new Set();

  while (remaining.length > 0) {
    // Find a match where neither team played in the last match
    let foundIndex = -1;
    for (let i = 0; i < remaining.length; i++) {
      const match = remaining[i];
      const homeId = match.homeTeamId;
      const awayId = match.awayTeamId;
      
      const homeConflict = homeId && lastTeamIds.has(homeId);
      const awayConflict = awayId && lastTeamIds.has(awayId);
      
      if (!homeConflict && !awayConflict) {
        foundIndex = i;
        break;
      }
    }

    // If no valid match found, take the first one (unavoidable conflict)
    if (foundIndex === -1) {
      console.warn("[RestAware] Could not avoid back-to-back match, taking first available");
      foundIndex = 0;
    }

    const chosen = remaining.splice(foundIndex, 1)[0];
    ordered.push(chosen);

    // Update last team IDs
    lastTeamIds = new Set();
    if (chosen.homeTeamId) lastTeamIds.add(chosen.homeTeamId);
    if (chosen.awayTeamId) lastTeamIds.add(chosen.awayTeamId);
  }

  return ordered;
}

/**
 * Reorders matches so that no participant appears in consecutive matches.
 */
export function applyRestAwareOrdering(matches: ScheduledMatch[]): ScheduledMatch[] {
  if (matches.length <= 1) return matches;

  const remaining = [...matches];
  const ordered: ScheduledMatch[] = [];
  let lastParticipantIds: Set<string> = new Set();

  while (remaining.length > 0) {
    let foundIndex = -1;
    for (let i = 0; i < remaining.length; i++) {
      const match = remaining[i];
      const homeId = match.homeParticipantId;
      const awayId = match.awayParticipantId;
      
      const homeConflict = homeId && lastParticipantIds.has(homeId);
      const awayConflict = awayId && lastParticipantIds.has(awayId);
      
      if (!homeConflict && !awayConflict) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      console.warn("[RestAware] Could not avoid back-to-back match for participant, taking first available");
      foundIndex = 0;
    }

    const chosen = remaining.splice(foundIndex, 1)[0];
    ordered.push(chosen);

    lastParticipantIds = new Set();
    if (chosen.homeParticipantId) lastParticipantIds.add(chosen.homeParticipantId);
    if (chosen.awayParticipantId) lastParticipantIds.add(chosen.awayParticipantId);
  }

  return ordered;
}

/**
 * Randomize matches within each round, then apply rest-aware ordering.
 * This ensures randomized but fair scheduling.
 */
export function randomizeAndOrderTeamMatches(matches: ScheduledTeamMatch[]): ScheduledTeamMatch[] {
  // Group by round
  const byRound = new Map<number, ScheduledTeamMatch[]>();
  for (const m of matches) {
    const list = byRound.get(m.round) || [];
    list.push(m);
    byRound.set(m.round, list);
  }

  // Shuffle each round, then apply rest-aware ordering
  const result: ScheduledTeamMatch[] = [];
  const rounds = Array.from(byRound.keys()).sort((a, b) => a - b);
  
  for (const round of rounds) {
    const roundMatches = byRound.get(round) || [];
    const shuffled = shuffle(roundMatches);
    const ordered = applyRestAwareOrderingTeams(shuffled);
    result.push(...ordered);
  }

  return result;
}

export function randomizeAndOrderMatches(matches: ScheduledMatch[]): ScheduledMatch[] {
  // Group by round
  const byRound = new Map<number, ScheduledMatch[]>();
  for (const m of matches) {
    const list = byRound.get(m.round) || [];
    list.push(m);
    byRound.set(m.round, list);
  }

  // Shuffle each round, then apply rest-aware ordering
  const result: ScheduledMatch[] = [];
  const rounds = Array.from(byRound.keys()).sort((a, b) => a - b);
  
  for (const round of rounds) {
    const roundMatches = byRound.get(round) || [];
    const shuffled = shuffle(roundMatches);
    const ordered = applyRestAwareOrdering(shuffled);
    result.push(...ordered);
  }

  return result;
}
