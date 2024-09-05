import { saveGameState } from "../game";
import { notification } from "~~/utils/scaffold-eth";

export const fetchAblyApiKey = async () => {
  const response = await fetch("/api/ably", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const ablyApiKey = await response.json();
  return ablyApiKey;
};

export const joinGame = async (invite: string, address: string) => {
  const response = await fetch("/api/player/join", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inviteCode: invite, playerAddress: address }),
  });

  const data = await response.json();

  if (data.error) {
    notification.error(data.error);
    return { success: false };
  }

  saveGameState(JSON.stringify(data));
  notification.success(`${data.message}`);
  return { success: true, game: data.game, player: data.player, token: data.token };
};

export const getGame = async (invite: string) => {
  const response = await fetch(`/api/game/${invite}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const game = await response.json();
  saveGameState(JSON.stringify(game));
  return game;
};

export const updateGameStatus = async (id: string, newStatus: string, token: string) => {
  const response = await fetch("/api/host/updategamestatus", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id, newStatus: newStatus }),
  });

  const updatedGame = await response.json();

  if (updatedGame.error) {
    notification.error(updatedGame.error);
    return;
  }

  notification.success(` ${updatedGame.message}`);
};

export const updatePlayerRound = async (id: string, token: string, address: string, won: boolean) => {
  const response = await fetch("/api/player/updateplayerround", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id, address: address, won: won }),
  });

  const updatedGame = await response.json();

  if (updatedGame.error) {
    // notification.error(updatedGame.error);
    console.log(updatedGame.error);
    return;
  }
};

export const updateGameRound = async (id: string, token: string) => {
  const response = await fetch("/api/host/updategameround", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  });

  const updatedGame = await response.json();

  if (updatedGame.error) {
    notification.error(updatedGame.error);
    console.log(updatedGame.error);
    return;
  }

  notification.success(` ${updatedGame.message}`);
};

export const updatePlayerStatus = async (
  id: string,
  newStatus: string,
  token: string,
  address: string,
  drawing?: string,
) => {
  const response = await fetch("/api/player/updateplayerstatus", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id, newStatus: newStatus, address: address, drawing: drawing }),
  });

  const updatedGame = await response.json();

  if (updatedGame.error) {
    // notification.error(updatedGame.error);
    console.log(updatedGame.error);
    return;
  }
};

export const createUsername = async (address: string) => {
  const response = await fetch("/api/game/createusername", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address: address }),
  });

  const data = await response.json();

  if (data.error) {
    return { success: false };
  }

  return { success: true, username: data.username };
};

export const editUsername = async (address: string, newUsername: string) => {
  const response = await fetch("/api/game/createusername", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address: address, newUsername: newUsername }),
  });

  const data = await response.json();

  if (data.error) {
    notification.error(data.error);
    return { success: false };
  }

  notification.success(`${data.message}`);
  return { success: true, username: data.username };
};
