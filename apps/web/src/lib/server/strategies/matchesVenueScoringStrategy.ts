import type { FixtureStatsSnapshot } from '@black-diamond/core/fixtureStatsSnapshot';

function averageGoalsScored(goalsFor: number, played: number) {
	return played === 0 ? null : goalsFor / played;
}

export function matchesVenueScoringStrategy(
	snapshot: FixtureStatsSnapshot,
	minimumGoalsPerFixture = 1.5
) {
	const homeGoalsPerHomeFixture = averageGoalsScored(
		snapshot.home.fixtures.home.goalsFor,
		snapshot.home.fixtures.home.played
	);
	const awayGoalsPerAwayFixture = averageGoalsScored(
		snapshot.away.fixtures.away.goalsFor,
		snapshot.away.fixtures.away.played
	);

	return (
		homeGoalsPerHomeFixture !== null &&
		awayGoalsPerAwayFixture !== null &&
		homeGoalsPerHomeFixture >= minimumGoalsPerFixture &&
		awayGoalsPerAwayFixture >= minimumGoalsPerFixture
	);
}

export function getVenueScoringAverages(snapshot: FixtureStatsSnapshot) {
	return {
		homeGoalsPerHomeFixture: averageGoalsScored(
			snapshot.home.fixtures.home.goalsFor,
			snapshot.home.fixtures.home.played
		),
		awayGoalsPerAwayFixture: averageGoalsScored(
			snapshot.away.fixtures.away.goalsFor,
			snapshot.away.fixtures.away.played
		)
	};
}
