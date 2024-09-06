import CanvasDraw from "react-canvas-draw";

export interface Round {
  round: number;
  points: number;
  won: boolean;
  drawings: string[];
}

export interface Player {
  address: string;
  userName: string;
  status: "waiting" | "drawing" | "classifying";
  currentRound: number;
  rounds: Round[];
  _id: string;
}

export interface Game {
  _id: string;
  hostAddress: string;
  hostUsername: string;
  status: "lobby" | "ongoing" | "paused" | "finished";
  inviteCode: string;
  players: Player[];
  winners: string[][];
  wordsList: string[];
  totalRounds: number;
  currentRound: number;
}

export interface CanvasDrawLines extends CanvasDraw {
  canvas: any;
  props: {
    brushColor: string;
    canvasWidth: any;
    canvasHeight: any;
  };
}
