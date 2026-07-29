export type Prize = {
  rank: number;
  winners: number;
  perWinner: number;
  total: number;
};

export type Draw = {
  round: number;
  date: string; // YYYY-MM-DD
  numbers: number[]; // 오름차순 6개
  bonus: number;
  prizes: Prize[];
  firstPrizeTypes: { auto: number; manual: number; semiAuto: number };
  totalWinners: number;
  sales: number;
};
