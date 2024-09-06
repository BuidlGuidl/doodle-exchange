import { Game } from "~~/types/game/game";

const STORAGE_KEY = "game_sk";

export const saveGameState = (gameState: string) => {
  if (typeof window != "undefined" && window != null) {
    window.localStorage.setItem(STORAGE_KEY, gameState);
  }
};

export const loadGameState = () => {
  if (typeof window != "undefined" && window != null) {
    const gameState = window.localStorage.getItem(STORAGE_KEY);
    if (gameState) return JSON.parse(gameState);
  } else return { token: null, game: null };
};

export const updateGameState = (game: string) => {
  if (typeof window != "undefined" && window != null) {
    let gameState = window.localStorage.getItem(STORAGE_KEY);

    if (gameState) {
      const gameStateObj = JSON.parse(gameState);
      gameStateObj.game = game;
      gameState = JSON.stringify(gameStateObj);
      window.localStorage.setItem(STORAGE_KEY, gameState);
      return gameState;
    }
  }
};

export const updatePlayerState = (player: string) => {
  if (typeof window != "undefined" && window != null) {
    let gameState = window.localStorage.getItem(STORAGE_KEY);

    if (gameState) {
      const gameStateObj = JSON.parse(gameState);
      gameStateObj.player = player;
      gameState = JSON.stringify(gameStateObj);
      window.localStorage.setItem(STORAGE_KEY, gameState);
      return gameState;
    }
  }
};

export function getTopPlayers(game: Game, playerAddress: string) {
  const playersWithPoints = game.players.map(player => {
    const totalPoints = player.rounds.reduce((acc, round) => acc + round.points, 0);
    return {
      address: player.address,
      userName: player.userName,
      totalPoints,
    };
  });

  playersWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);

  const rankedPlayers = playersWithPoints.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));

  const playerIndex = rankedPlayers.findIndex(p => p.address === playerAddress);

  if (playerIndex === -1) {
    throw new Error("Player not found");
  }

  const topPlayers = rankedPlayers.slice(0, 3);

  if (playerIndex > 2) {
    topPlayers.push(rankedPlayers[playerIndex]);
  }

  return topPlayers.slice(0, Math.min(4, rankedPlayers.length));
}
