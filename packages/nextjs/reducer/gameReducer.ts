import { Game, Player } from "~~/types/game/game";

export const initialState = {
  isHost: false,
  isPlayer: false,
  game: null as Game | null,
  player: null as Player | null,
  token: "",
  isUpdatingRound: false,
  updateRoundCountdown: 20,
  showRoundCountdown: false,
  nextRoundCountdown: 5,
  pauseAtRoundsEnd: false,
  isRoundEnding: false,
};

export type GameAction =
  | { type: "SET_HOST"; payload: boolean }
  | { type: "SET_PLAYER"; payload: boolean }
  | { type: "SET_GAME"; payload: Game }
  | { type: "SET_PLAYER_DATA"; payload: Player }
  | { type: "SET_TOKEN"; payload: string }
  | { type: "SET_UPDATING_ROUND"; payload: boolean }
  | { type: "SET_UPDATE_ROUND_COUNTDOWN"; payload: number }
  | { type: "SET_SHOW_ROUND_COUNTDOWN"; payload: boolean }
  | { type: "SET_NEXT_ROUND_COUNTDOWN"; payload: number }
  | { type: "SET_PAUSE_AT_ROUNDS_END"; payload: boolean }
  | { type: "SET_ROUND_ENDING"; payload: boolean };

export function gameReducer(state: typeof initialState, action: GameAction) {
  switch (action.type) {
    case "SET_HOST":
      return { ...state, isHost: action.payload };
    case "SET_PLAYER":
      return { ...state, isPlayer: action.payload };
    case "SET_GAME":
      return { ...state, game: action.payload };
    case "SET_PLAYER_DATA":
      return { ...state, player: action.payload };
    case "SET_TOKEN":
      return { ...state, token: action.payload };
    case "SET_UPDATING_ROUND":
      return { ...state, isUpdatingRound: action.payload };
    case "SET_UPDATE_ROUND_COUNTDOWN":
      return { ...state, updateRoundCountdown: action.payload };
    case "SET_SHOW_ROUND_COUNTDOWN":
      return { ...state, showRoundCountdown: action.payload };
    case "SET_NEXT_ROUND_COUNTDOWN":
      return { ...state, nextRoundCountdown: action.payload };
    case "SET_PAUSE_AT_ROUNDS_END":
      return { ...state, pauseAtRoundsEnd: action.payload };
    case "SET_ROUND_ENDING":
      return { ...state, isRoundEnding: action.payload };
    default:
      return state;
  }
}
