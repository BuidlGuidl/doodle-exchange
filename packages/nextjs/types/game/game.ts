export interface Game {
  _id: string;
  hostAddress: string;
  status: "lobby" | "ongoing" | "paused" | "finished";
  inviteCode: string;
  players: string[];
  winners: string[];
  wordsList: string[];
  totalRounds: number;
  currentRound: number;
}
