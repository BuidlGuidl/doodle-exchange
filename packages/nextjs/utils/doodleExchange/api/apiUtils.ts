import { saveGameState } from "../game";
import { notification } from "~~/utils/scaffold-eth";

export const joinGame = async (invite: string, address: string) => {
  const response = await fetch("/api/player/join", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inviteCode: invite, playerAddress: address }),
  });

  const updatedGame = await response.json();

  if (updatedGame.error) {
    notification.error(updatedGame.error);
    return { success: false };
  }

  saveGameState(JSON.stringify(updatedGame));
  return { success: true };
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

  notification.success(`Game ${newStatus}`);
};

export const updatePlayerRound = async (id: string, newRound: number, token: string, address: string, won: boolean) => {
  // const response =

  await fetch("/api/player/updateplayerround", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id, newRound: newRound, address: address, won: won }),
  });

  // const updatedGame = await response.json();

  // if (updatedGame.error) {
  //   notification.error(updatedGame.error);
  //   return;
  // }

  // notification.success(`Moving to next round: ${newRound + 1}`);
};

export const updateGameRound = async (id: string, newRound: number, token: string) => {
  const response = await fetch("/api/host/updategameround", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id, newRound: newRound }),
  });

  const updatedGame = await response.json();

  if (updatedGame.error) {
    notification.error(updatedGame.error);
    return;
  }

  notification.success(`Moving to next round: ${newRound + 1}`);
};

export const updatePlayerStatus = async (id: string, newStatus: string, token: string, address: string) => {
  // const response =

  await fetch("/api/player/updateplayerstatus", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id, newStatus: newStatus, address: address }),
  });

  // const updatedGame = await response.json();

  // if (updatedGame.error) {
  //   notification.error(updatedGame.error);
  //   return;
  // }

  // notification.success(`Moving to next round: ${newRound + 1}`);
};
