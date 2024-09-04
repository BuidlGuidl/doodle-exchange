"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Host from "../_components/Host";
import Lobby from "../_components/Lobby";
import Player from "../_components/Player";
import Results from "../_components/Results";
import RoundCountdown from "../_components/RoundCountdown";
import { useChannel } from "ably/react";
import { useAccount } from "wagmi";
import useGameData from "~~/hooks/doodleExchange/useGameData";
import { Game, Player as playerType } from "~~/types/game/game";
import { joinGame, updateGameRound, updatePlayerRound } from "~~/utils/doodleExchange/api/apiUtils";
import { notification } from "~~/utils/scaffold-eth";

const GamePage = () => {
  const { id } = useParams();
  const { updateGameState, updatePlayerState, loadToken } = useGameData();
  const { address: connectedAddress } = useAccount();

  const [isHost, setIsHost] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);
  const [game, setGame] = useState<Game>();
  const [player, setPlayer] = useState<playerType>();
  const [token, setToken] = useState("");
  const [isUpdatingRound, setIsUpdatingRound] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [showCountdownOverlay, setShowCountdownOverlay] = useState(false);

  useChannel("gameUpdate", message => {
    console.log(message);
    if (game?._id === message.data._id) {
      const player = message.data.players.find((player: playerType) => player.address === connectedAddress);
      setPlayer(player);
      if (player) updatePlayerState(JSON.stringify(player));
      setGame(message.data);
      updateGameState(JSON.stringify(message.data));
    }
  });

  useChannel("startResumeGame", message => {
    console.log(message);
    if (game?._id === message.data._id) {
      setShowCountdownOverlay(true);
    }
  });

  useChannel("playerUpdate", message => {
    console.log(message);
    if (player?._id === message.data._id) {
      updatePlayerState(JSON.stringify(message.data));
      setPlayer(message.data);
    }
  });

  useChannel("updateRound", message => {
    console.log(message);
    if (isUpdatingRound) return;
    if (game?._id === message.data._id) {
      setIsUpdatingRound(true);
      notification.info(
        game?.currentRound == (game?.totalRounds as number) - 1
          ? `Ending game in ${countdown} seconds`
          : `Moving to the next round in ${countdown} seconds`,
      );

      const interval = setInterval(() => {
        setCountdown(oldCount => (oldCount <= 1 ? 0 : oldCount - 1));
      }, 1000);

      setTimeout(async () => {
        if (isHost && game) {
          await updateGameRound(game._id, token);
        }
        setIsUpdatingRound(false);
        setCountdown(20);
        clearInterval(interval);
        setShowCountdownOverlay(true);
      }, 20000);
    }
  });

  useEffect(() => {
    const loadGame = async () => {
      const response = await fetch(`/api/game/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseData = await response.json();
      if (connectedAddress === responseData.hostAddress) {
        setIsHost(true);
        setGame(responseData);
        setToken(loadToken());
      } else if (responseData.players.some((player: playerType) => player.address === connectedAddress)) {
        const player = responseData.players.find((player: playerType) => player.address === connectedAddress);
        setPlayer(player);
        setIsPlayer(true);
        setGame(responseData);
        setToken(loadToken());
      } else {
        if (connectedAddress) {
          const data = await joinGame(id as string, connectedAddress);
          if (data.success) {
            setGame(data.game);
            setPlayer(data.player);
            setToken(data.token);
            setIsPlayer(true);
          } else {
            setIsPlayer(false);
          }
        }
      }
    };

    loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress, id]);

  const moveToNextRound = async (address: string, won: boolean) => {
    if (game) await updatePlayerRound(game._id, token, address, won);
  };

  const handleCountdownEnd = () => {
    setShowCountdownOverlay(false); // Hide the overlay after countdown ends
  };

  if (game?.status === "finished") {
    return <Results game={game as Game} connectedAddress={connectedAddress || ""} />;
  } else if (isHost && game) {
    return <Host game={game as Game} token={token} isUpdatingRound={isUpdatingRound} countdown={countdown} />;
  } else if (isPlayer && game && game?.status === "lobby") {
    return <Lobby game={game as Game} connectedAddress={connectedAddress || ""} />;
  } else if (isPlayer && game) {
    return (
      <>
        <Player
          game={game as Game}
          moveToNextRound={moveToNextRound}
          player={player as playerType}
          isUpdatingRound={isUpdatingRound}
          countdown={countdown}
          token={token}
        />
        {showCountdownOverlay && game.currentRound < game.totalRounds && (
          <RoundCountdown onCountdownEnd={handleCountdownEnd} />
        )}
      </>
    );
  } else {
    return (
      <div className="p-4">
        <h1>Loading...</h1>
      </div>
    );
  }
};

export default GamePage;
