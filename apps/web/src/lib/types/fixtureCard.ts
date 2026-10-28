type FixtureRecord = {
	played: number;
	wins: number;
	draws: number;
	loses: number;
	goalsFor: number;
	goalsAgainst: number;
};

type FixtureStatsTeam = {
	leaguePosition: number | null;
	leagueTeams: number;
	form: string;
	fixtures: {
		total: {
			played: number;
			goalsFor: number;
			goalsAgainst: number;
		};
	};
	cleanSheets: {
		total: number;
	};
	summary: {
		wins: { percentage: number };
		draws: { percentage: number };
	};
};

export type FixtureStatsData = {
	home: FixtureStatsTeam & {
		formHome: string;
		fixtures: FixtureStatsTeam['fixtures'] & { home: FixtureRecord };
		cleanSheets: FixtureStatsTeam['cleanSheets'] & { home: number };
	};
	away: FixtureStatsTeam & {
		formAway: string;
		fixtures: FixtureStatsTeam['fixtures'] & { away: FixtureRecord };
		cleanSheets: FixtureStatsTeam['cleanSheets'] & { away: number };
	};
};

export type FixtureOddsData = {
	odds: Array<{
		name: string;
		values: Array<{ value: string; odd: string }>;
	}>;
};

export type FixturePredictionData = {
	advice: string | null;
	percent: {
		home: string | null;
		draw: string | null;
		away: string | null;
	};
};

export type FixtureOddSelection = {
	marketName: string;
	value: string;
	odd: string | null;
};

export type FixtureCardData = {
	id: number;
	timestamp: number;
	status: {
		short: string;
		long: string;
		elapsed: number | null;
	};
	round: string | null;
	leagueName: string;
	leagueId: number;
	leagueSeason: number;
	hasLeagueTable?: boolean;
	leagueOrder: number;
	leagueCountry: string;
	leagueLogo: string | null;
	venueName: string | null;
	venueCity: string | null;
	homeTeamName: string;
	homeTeamId: number;
	homeTeamLogo: string;
	awayTeamName: string;
	awayTeamId: number;
	awayTeamLogo: string;
	homeGoals: number | null;
	awayGoals: number | null;
	fullTimeScore?: { home: number | null; away: number | null };
	extraTimeScore?: { home: number | null; away: number | null };
	penaltyScore?: { home: number | null; away: number | null };
	stats: FixtureStatsData | null;
	odds: FixtureOddsData | null;
	prediction: FixturePredictionData | null;
	events: FixtureEvent[];
	statistics: {
		home: { shots: number | null; shotsOnTarget: number | null; possession: number | null };
		away: { shots: number | null; shotsOnTarget: number | null; possession: number | null };
	} | null;
	injuries: FixtureInjury[] | null;
	lineups: FixtureTeamLineup[] | null;
};
import type { FixtureEvent } from '@black-diamond/core/fixtureEvents';
import type { FixtureInjury } from '@black-diamond/core/fixtureInjuries';
import type { FixtureTeamLineup } from '@black-diamond/core/fixtureLineups';
