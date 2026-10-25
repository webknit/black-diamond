type OddsMarket = {
  name: string;
  values: Array<{ value: string; odd: string }>;
};

export function getOver2_5ReferenceOdd(odds: OddsMarket[]): number | null {
  const market = odds.find((item) => {
    const name = item.name.trim().toLowerCase();
    return name === 'goals over/under' || name === 'goals over under';
  });
  const selection = market?.values.find(
    (item) => item.value.trim().toLowerCase() === 'over 2.5'
  );
  const odd = Number(selection?.odd);

  return Number.isFinite(odd) && odd > 1 ? odd : null;
}
