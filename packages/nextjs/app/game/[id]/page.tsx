"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Host from "../_components/Host";
import Lobby from "../_components/Lobby";
import Player from "../_components/Player";
import Results from "../_components/Results";
import RoundCountdown from "../_components/RoundCountdown";
import { useAbly, useChannel } from "ably/react";
import { AnimatePresence } from "framer-motion";
import { motion as m } from "framer-motion";
import { useAccount } from "wagmi";
import useGameData from "~~/hooks/doodleExchange/useGameData";
import { Game, Player as playerType } from "~~/types/game/game";
import { joinGame, updateGameRound, updatePlayerRound } from "~~/utils/doodleExchange/api/apiUtils";
import { notification } from "~~/utils/scaffold-eth";

const GamePage = () => {
  const { id } = useParams();
  const { updateGameState, updatePlayerState, loadToken } = useGameData();
  const { address: connectedAddress } = useAccount();
  const router = useRouter();
  const client = useAbly();

  const [isHost, setIsHost] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);
  const [game, setGame] = useState<Game>();
  const [player, setPlayer] = useState<playerType>();
  const [token, setToken] = useState("");
  const [isUpdatingRound, setIsUpdatingRound] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [showCountdown, setShowCountdown] = useState(false);
  const [pauseAtRoundsEnd, setPauseAtRoundsEnd] = useState(false);

  useChannel("gameUpdate", message => {
    if (game?._id === message.data._id) {
      const player = message.data.players.find((player: playerType) => player.address === connectedAddress);
      setPlayer(player);
      if (player) updatePlayerState(JSON.stringify(player));
      setGame(message.data);
      updateGameState(JSON.stringify(message.data));
    }
  });

  useChannel("startResumeGame", message => {
    if (game?._id === message.data._id) {
      setShowCountdown(true);
    }
  });

  useChannel("playerUpdate", message => {
    if (player?._id === message.data._id) {
      updatePlayerState(JSON.stringify(message.data));
      setPlayer(message.data);
    }
  });

  useChannel("updateRound", message => {
    if (isUpdatingRound) return;
    if (game?._id === message.data._id) {
      setIsUpdatingRound(true);
      notification.info(
        game?.currentRound == (game?.totalRounds as number) - 1
          ? `Ending game in ${countdown} seconds`
          : `Next round begins in ${countdown} seconds`,
      );

      const interval = setInterval(() => {
        setCountdown(oldCount => (oldCount <= 1 ? 0 : oldCount - 1));
      }, 1000);

      setTimeout(() => {
        if (game && game?.currentRound < game?.totalRounds - 1) {
          setShowCountdown(true);
        }
      }, 22000);

      setTimeout(async () => {
        if (isHost && game) {
          await updateGameRound(game._id, token, pauseAtRoundsEnd);
          setPauseAtRoundsEnd(false);
        }
        setIsUpdatingRound(false);
        setCountdown(20);
        clearInterval(interval);
      }, 26000);
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
      if (responseData.error) {
        router.push(`/`);
        notification.error(responseData.error);
        return;
      }
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
            router.push(`/`);
          }
        }
      }
    };

    loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress, id]);

  useEffect(() => {
    const loadGame = async () => {
      const response = await fetch(`/api/game/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();
      if (responseData.error) {
        console.log(responseData.error);
        return;
      } else {
        setGame(responseData);
        if (responseData.players.some((player: playerType) => player.address === connectedAddress)) {
          const player = responseData.players.find((player: playerType) => player.address === connectedAddress);
          setPlayer(player);
        }
      }
    };

    const interval = setInterval(() => {
      loadGame();
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const moveToNextRound = async (address: string, won: boolean) => {
    if (game) await updatePlayerRound(game._id, token, address, won);
  };

  const handleCountdownEnd = () => {
    setShowCountdown(false); // Hide the overlay after countdown ends
  };

  if (game?.status === "finished") {
    client.close();
    return <Results game={game as Game} connectedAddress={connectedAddress || ""} />;
  } else if (isHost && game) {
    return (
      <Host
        game={game as Game}
        token={token}
        isUpdatingRound={isUpdatingRound}
        countdown={countdown}
        showCountdown={showCountdown}
        pauseAtRoundsEnd={pauseAtRoundsEnd}
        setPauseAtRoundsEnd={setPauseAtRoundsEnd}
      />
    );
  } else if (isPlayer && game && game?.status === "lobby") {
    return <Lobby game={game as Game} connectedAddress={connectedAddress || ""} />;
  } else if (isPlayer && game) {
    return (
      <AnimatePresence initial={false}>
        {showCountdown && game.status == "ongoing" ? (
          <RoundCountdown game={game} onCountdownEnd={handleCountdownEnd} />
        ) : game.status == "paused" ? (
          <m.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 text-7xl text-white"
          >
            Game has been paused
          </m.div>
        ) : (
          <Player
            game={game as Game}
            moveToNextRound={moveToNextRound}
            player={player as playerType}
            isUpdatingRound={isUpdatingRound}
            countdown={countdown}
            token={token}
          />
        )}
      </AnimatePresence>
    );
  } else {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
        <span className="loading loading-ball loading-xs"></span>
        <span className="loading loading-ball loading-sm"></span>
        <span className="loading loading-ball loading-md"></span>
        <span className="loading loading-ball loading-lg"></span>
      </div>
    );
  }
};

export default GamePage;
