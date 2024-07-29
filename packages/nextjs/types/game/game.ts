export interface Game {
  _id: string;
  hostAddress: string;
  status: "lobby" | "ongoing" | "paused" | "finished";
  inviteCode: string;
  players: string[];
  winner?: string;
}
