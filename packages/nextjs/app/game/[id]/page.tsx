"use client";

import { useEffect, useRef, useState } from "react";
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
import { joinGame, updateGameRound, updateGameStatus, updatePlayerRound } from "~~/utils/doodleExchange/api/apiUtils";
import { notification } from "~~/utils/scaffold-eth";

const GamePage = () => {
  const { id } = useParams();
  const { loadToken } = useGameData();
  const { address: connectedAddress } = useAccount();
  const router = useRouter();
  const client = useAbly();

  const [isHost, setIsHost] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);
  const [game, setGame] = useState<Game>();
  const gameRef = useRef(game);
  const [player, setPlayer] = useState<playerType>();

  const [token, setToken] = useState("");
  const [isUpdatingRound, setIsUpdatingRound] = useState(false);
  const isUpdatingRoundRef = useRef(isUpdatingRound);
  const [updateRoundCountdown, setUpdateRoundCountdown] = useState(20);
  const [showRoundCountdown, setShowRoundCountdown] = useState(false);
  const [nextRoundCountdown, setNextRoundCountdown] = useState(5);
  const [pauseAtRoundsEnd, setPauseAtRoundsEnd] = useState(false);
  const pauseAtRoundsEndRef = useRef(pauseAtRoundsEnd);

  const [isRoundEnding, setIsRoundEnding] = useState(false);

  const timeoutTimeoutRef = useRef<NodeJS.Timer | null>(null);

  const resetTimeout = () => {
    clearTimeout(timeoutTimeoutRef.current as NodeJS.Timer);
    setIsRoundEnding(false);
  };

  useChannel("gameUpdate", message => {
    if (game?._id === message.data._id) {
      const player = message.data.players.find((player: playerType) => player.address === connectedAddress);
      setPlayer(player);
      setGame(message.data);
    }
  });

  useChannel("startResumeGame", message => {
    if (game?._id === message.data._id) {
      setShowRoundCountdown(true);
      resetTimeout();
    }
  });

  useChannel("playerUpdate", message => {
    if (player?._id === message.data._id) {
      setPlayer(message.data);
    }
  });

  useChannel("updateRound", message => {
    if (isUpdatingRound) return;
    if (game?._id === message.data._id) {
      setIsUpdatingRound(true);
      resetTimeout();
      notification.info(
        game?.currentRound == (game?.totalRounds as number) - 1
          ? `Ending game in ${updateRoundCountdown} seconds`
          : `Next round begins in ${updateRoundCountdown} seconds`,
      );

      const interval = setInterval(() => {
        setUpdateRoundCountdown(oldCount => (oldCount <= 1 ? 0 : oldCount - 1));
      }, 1000);

      setTimeout(() => {
        if (gameRef.current && gameRef.current.currentRound < gameRef.current.totalRounds - 1) {
          setShowRoundCountdown(true);
          resetTimeout();
        }
      }, 22000);

      setTimeout(async () => {
        if (gameRef.current && game) {
          if (isHost && pauseAtRoundsEnd) {
            await updateGameStatus(game?._id, "paused", token);
          }
          await updateGameRound(game._id, token, gameRef.current.currentRound + 1);
          setPauseAtRoundsEnd(false);
        }
        resetTimeout();
        setIsUpdatingRound(false);
        setUpdateRoundCountdown(20);
        clearInterval(interval);
      }, 24000);
    }
  });

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    isUpdatingRoundRef.current = isUpdatingRound;
  }, [isUpdatingRound]);

  useEffect(() => {
    pauseAtRoundsEndRef.current = pauseAtRoundsEnd;
  }, [pauseAtRoundsEnd]);

  useEffect(() => {
    if (!showRoundCountdown) return;
    let timer: any;
    if (nextRoundCountdown >= 0) {
      timer = setTimeout(() => {
        setNextRoundCountdown(nextRoundCountdown - 1);
      }, 1000);
    } else {
      resetTimeout();
      setShowRoundCountdown(false);
      setNextRoundCountdown(5);
    }

    return () => clearTimeout(timer);
  }, [nextRoundCountdown, showRoundCountdown]);

  useEffect(() => {
    if (showRoundCountdown || isUpdatingRound) {
      resetTimeout();
      return;
    }
    if (isRoundEnding) return;
    if (game?.status !== "ongoing") return;

    clearTimeout(timeoutTimeoutRef.current as NodeJS.Timer);
    setIsRoundEnding(true);

    const executeRoundUpdate = async () => {
      if (isUpdatingRoundRef.current) {
        resetTimeout();
        return;
      }
      if (gameRef.current && gameRef.current?.currentRound === gameRef.current?.currentRound + 1) {
        return;
      }

      setShowRoundCountdown(true);
      resetTimeout();
      setIsRoundEnding(false);

      if (gameRef.current && game) {
        if (isHost && pauseAtRoundsEndRef.current) {
          await updateGameStatus(game._id, "paused", token);
        }
        await updateGameRound(game._id, token, gameRef.current.currentRound + 1);
        setPauseAtRoundsEnd(false);
      }
      notification.info(
        gameRef.current?.currentRound == (gameRef.current?.totalRounds as number) - 1
          ? `Timeout: Ending game `
          : `Timeout: Next round begins`,
      );

      clearTimeout(timeoutTimeoutRef.current as NodeJS.Timer);
    };

    const elapsedTime = Date.now() - (gameRef.current?.lastRoundStartTimestamp as number);
    const remainingTime = Math.max(67000 - elapsedTime, 0);

    if (remainingTime <= 0) {
      executeRoundUpdate();
    } else {
      timeoutTimeoutRef.current = setTimeout(executeRoundUpdate, remainingTime);
    }
  }, [showRoundCountdown, isUpdatingRound, game]);

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
    const refreshGame = async () => {
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
      refreshGame();
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const moveToNextRound = async (address: string, won: boolean) => {
    if (game) await updatePlayerRound(game._id, token, address, won);
  };

  if (game?.status === "finished") {
    if (client.connection.state == "connected") client.close();
    return <Results game={game as Game} connectedAddress={connectedAddress || ""} />;
  } else if (isHost && game) {
    return (
      <Host
        game={game as Game}
        token={token}
        isUpdatingRound={isUpdatingRound}
        updateRoundCountdown={updateRoundCountdown}
        pauseAtRoundsEnd={pauseAtRoundsEnd}
        setPauseAtRoundsEnd={setPauseAtRoundsEnd}
        showRoundCountdown={showRoundCountdown}
      />
    );
  } else if (isPlayer && game && game.status === "lobby") {
    return <Lobby game={game as Game} connectedAddress={connectedAddress || ""} />;
  } else if (isPlayer && game) {
    return (
      <AnimatePresence initial={false}>
        {showRoundCountdown && game.status == "ongoing" ? (
          <RoundCountdown game={game} nextRoundCountdown={nextRoundCountdown} />
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
            updateRoundCountdown={updateRoundCountdown}
            token={token}
            showRoundCountdown={showRoundCountdown}
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
