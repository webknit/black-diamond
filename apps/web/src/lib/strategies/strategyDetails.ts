export type StrategyId = 'bothTeamsAboveLeagueAverage' | 'neitherTeamLowScoring';

export type StrategyDetails = {
	id: StrategyId;
	title: string;
	description: string;
};

export const strategyDetails: StrategyDetails[] = [
	{
		id: 'bothTeamsAboveLeagueAverage',
		title: 'Over 2.5 goals · both teams above league average',
		description: 'Both teams’ season Over 2.5 rate must be higher than their league’s current season rate.'
	},
	{
		id: 'neitherTeamLowScoring',
		title: 'Over 2.5 goals · neither team low scoring',
		description:
			'Home team must average at least 1.5 goals scored at home, and away team at least 1.5 goals scored away, using pre-match stats.'
	}
];
