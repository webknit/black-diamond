type HomeAwayTotal = { home: number; away: number; total: number };
type CountAndPercentage = { total: number | null; percentage: string | null };

export type TeamStats = {
  league: { id: number; name: string; country: string; logo: string | null; flag: string | null; season: number };
  team: { id: number; name: string; logo: string | null };
  form: string | null;
  fixtures: { played: HomeAwayTotal; wins: HomeAwayTotal; draws: HomeAwayTotal; loses: HomeAwayTotal };
  goals: {
    for: { total: HomeAwayTotal; average: { home: string; away: string; total: string }; minute: Record<string, CountAndPercentage>; under_over: Record<string, { over: number; under: number }> };
    against: { total: HomeAwayTotal; average: { home: string; away: string; total: string }; minute: Record<string, CountAndPercentage>; under_over: Record<string, { over: number; under: number }> };
  };
  biggest: { streak: { wins: number; draws: number; loses: number }; wins: { home: string | null; away: string | null }; loses: { home: string | null; away: string | null }; goals: { for: { home: number; away: number }; against: { home: number; away: number } } };
  clean_sheet: HomeAwayTotal;
  failed_to_score: HomeAwayTotal;
  penalty: { scored: CountAndPercentage; missed: CountAndPercentage; total: number };
  lineups: Array<{ formation: string; played: number }>;
  cards: Record<string, Record<string, CountAndPercentage>>;
};
