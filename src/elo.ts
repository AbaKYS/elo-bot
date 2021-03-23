import EloRank from "elo-rank";
const elo = new EloRank();

export default (
  winnerElo: number,
  loserElo: number,
  kFactor?: number
): number => {
  const expected = elo.getExpected(winnerElo, loserElo);
  return (kFactor || 32) * (1 - expected);
};
