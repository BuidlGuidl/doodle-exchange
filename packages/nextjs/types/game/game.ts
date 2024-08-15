export type Player = {
  address: string;
  status: "waiting" | "drawing" | "classifying";
  currentRound: number;
  points: number[];
  wonRound: boolean[];
  _id: string;
};

export interface Game {
  _id: string;
  hostAddress: string;
  status: "lobby" | "ongoing" | "paused" | "finished";
  inviteCode: string;
  players: Player[];
  winners: string[][];
  wordsList: string[];
  totalRounds: number;
  currentRound: number;
}
