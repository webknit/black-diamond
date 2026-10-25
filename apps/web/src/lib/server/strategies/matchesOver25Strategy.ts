export function matchesOver25Strategy(
  homeOver25Percentage: number,
  awayOver25Percentage: number,
  leagueOver25Percentage: number | null
) {
  return (
    leagueOver25Percentage !== null &&
    homeOver25Percentage > leagueOver25Percentage &&
    awayOver25Percentage > leagueOver25Percentage
  );
}
