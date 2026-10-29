import { error, json } from '@sveltejs/kit';
import { getFixtureInjuriesForFixtures } from '@black-diamond/database/fixtureInjuries';
import { getFixtureLineupsForFixtures } from '@black-diamond/database/fixtureLineups';

export async function GET({ params }: { params: { fixtureId: string } }) {
	const fixtureId = Number(params.fixtureId);
	if (!Number.isSafeInteger(fixtureId) || fixtureId <= 0) throw error(400, 'Invalid fixture.');

	const [injuries, lineups] = await Promise.all([
		getFixtureInjuriesForFixtures([fixtureId]).then((items) => items[0]?.injuries ?? []),
		getFixtureLineupsForFixtures([fixtureId]).then((items) => items[0]?.lineups ?? [])
	]);

	return json({ injuries, lineups });
}
