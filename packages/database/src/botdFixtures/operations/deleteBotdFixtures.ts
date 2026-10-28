import { getDatabase } from "../../mongodb.js";

export async function deleteBotdFixtures(fixtureIds: number[]): Promise<void> {
  if (fixtureIds.length === 0) return;
  await (await getDatabase()).collection("botdFixtures").deleteMany({ fixtureId: { $in: fixtureIds } });
}
