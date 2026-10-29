import type { BotdFixture } from "./botdFixture.js";

/** Ready-to-render BotD candidates for one UK calendar day. */
export type BotdDay = {
  fixtureDate: string;
  fixtures: BotdFixture[];
  updatedAt: string;
};
