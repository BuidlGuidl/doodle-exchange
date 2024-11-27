"use client";

import { useEffect, useReducer, useRef } from "react";
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
import { gameReducer, initialState } from "~~/reducer/gameReducer";
import { Game, Player as playerType } from "~~/types/game/game";
import { joinGame, updateGameRound, updateGameStatus, updatePlayerRound } from "~~/utils/doodleExchange/api/apiUtils";
import { notification } from "~~/utils/scaffold-eth";

const GamePage = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const { id } = useParams();
  const { loadToken } = useGameData();
  const { address: connectedAddress } = useAccount();
  const router = useRouter();
  const client = useAbly();

  const gameRef = useRef(state.game);
  const isUpdatingRoundRef = useRef(state.isUpdatingRound);
  const pauseAtRoundsEndRef = useRef(state.pauseAtRoundsEnd);
  const timeoutTimeoutRef = useRef<NodeJS.Timer | null>(null);

  const resetTimeout = () => {
    clearTimeout(timeoutTimeoutRef.current as NodeJS.Timer);
    dispatch({ type: "SET_ROUND_ENDING", payload: false });
  };

  useChannel("gameUpdate", message => {
    if (state.game?._id === message.data._id) {
      const player = message.data.players.find((player: playerType) => player.address === connectedAddress);
      dispatch({ type: "SET_PLAYER_DATA", payload: player });
      dispatch({ type: "SET_GAME", payload: message.data });
    }
  });

  useChannel("startResumeGame", message => {
    if (state.game?._id === message.data._id) {
      dispatch({ type: "SET_SHOW_ROUND_COUNTDOWN", payload: true });
      resetTimeout();
    }
  });

  useChannel("playerUpdate", message => {
    if (state.player?._id === message.data._id) {
      dispatch({ type: "SET_PLAYER_DATA", payload: message.data });
    }
  });

  useChannel("updateRound", message => {
    if (state.isUpdatingRound) return;
    if (state.game?._id === message.data._id) {
      dispatch({ type: "SET_UPDATING_ROUND", payload: true });
      resetTimeout();

      const nextRoundTimestamp = message.data.nextRoundTimestamp;
      const currentTime = Date.now();
      const timeRemaining = Math.max(Math.floor((nextRoundTimestamp - currentTime) / 1000), 0);

      notification.info(
        state.game?.currentRound == (state.game?.totalRounds as number) - 1
          ? `Ending game in ${timeRemaining} seconds`
          : `Next round begins in ${timeRemaining} seconds`,
      );

      dispatch({ type: "SET_UPDATE_ROUND_COUNTDOWN", payload: timeRemaining });

      const countdownInterval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(Math.floor((nextRoundTimestamp - now) / 1000), 0);

        dispatch({ type: "SET_UPDATE_ROUND_COUNTDOWN", payload: remaining });

        if (remaining <= 0) {
          clearInterval(countdownInterval);
          dispatch({ type: "SET_SHOW_ROUND_COUNTDOWN", payload: false });
          dispatch({ type: "SET_UPDATING_ROUND", payload: false });
          dispatch({ type: "SET_SHOW_ROUND_COUNTDOWN", payload: true });
        }
      }, 1000);

      const roundTransitionTimeout = setTimeout(
        async () => {
          if (gameRef.current && state.game) {
            if (state.isHost && state.pauseAtRoundsEnd) {
              await updateGameStatus(state.game?._id, "paused", state.token);
            }
            await updateGameRound(state.game._id, state.token, gameRef.current.currentRound + 1);
            dispatch({ type: "SET_PAUSE_AT_ROUNDS_END", payload: false });
          }

          resetTimeout();
          dispatch({ type: "SET_UPDATING_ROUND", payload: false });
          dispatch({ type: "SET_UPDATE_ROUND_COUNTDOWN", payload: 20 });
          clearTimeout(roundTransitionTimeout);
        },
        timeRemaining * 1000 + 2000,
      );
    }
  });

  useEffect(() => {
    gameRef.current = state.game;
  }, [state.game]);

  useEffect(() => {
    isUpdatingRoundRef.current = state.isUpdatingRound;
  }, [state.isUpdatingRound]);

  useEffect(() => {
    pauseAtRoundsEndRef.current = state.pauseAtRoundsEnd;
  }, [state.pauseAtRoundsEnd]);

  useEffect(() => {
    if (!state.showRoundCountdown) return;
    let timer: any;
    if (state.nextRoundCountdown >= 0) {
      timer = setTimeout(() => {
        dispatch({ type: "SET_NEXT_ROUND_COUNTDOWN", payload: state.nextRoundCountdown - 1 });
      }, 1000);
    } else {
      resetTimeout();
      dispatch({ type: "SET_SHOW_ROUND_COUNTDOWN", payload: false });
      dispatch({ type: "SET_NEXT_ROUND_COUNTDOWN", payload: 5 });
    }

    return () => clearTimeout(timer);
  }, [state.nextRoundCountdown, state.showRoundCountdown]);

  useEffect(() => {
    if (state.showRoundCountdown || state.isUpdatingRound) {
      resetTimeout();
      return;
    }
    if (state.isRoundEnding) return;
    if (state.game?.status !== "ongoing") return;

    clearTimeout(timeoutTimeoutRef.current as NodeJS.Timer);
    dispatch({ type: "SET_ROUND_ENDING", payload: true });

    const executeRoundUpdate = async () => {
      if (isUpdatingRoundRef.current) {
        resetTimeout();
        return;
      }
      if (gameRef.current && gameRef.current?.currentRound === gameRef.current?.currentRound + 1) {
        return;
      }

      dispatch({ type: "SET_SHOW_ROUND_COUNTDOWN", payload: true });
      resetTimeout();
      dispatch({ type: "SET_ROUND_ENDING", payload: true });

      if (gameRef.current && state.game) {
        if (state.isHost && pauseAtRoundsEndRef.current) {
          await updateGameStatus(state.game._id, "paused", state.token);
        }
        await updateGameRound(state.game._id, state.token, gameRef.current.currentRound + 1);
        dispatch({ type: "SET_PAUSE_AT_ROUNDS_END", payload: false });
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
  }, [state.showRoundCountdown, state.isUpdatingRound, state.game]);

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
        dispatch({ type: "SET_HOST", payload: true });
        dispatch({ type: "SET_GAME", payload: responseData });
        dispatch({ type: "SET_TOKEN", payload: loadToken() });
      } else if (responseData.players.some((player: playerType) => player.address === connectedAddress)) {
        const player = responseData.players.find((player: playerType) => player.address === connectedAddress);
        dispatch({ type: "SET_PLAYER", payload: true });
        dispatch({ type: "SET_GAME", payload: responseData });
        dispatch({ type: "SET_TOKEN", payload: loadToken() });
        dispatch({ type: "SET_PLAYER_DATA", payload: player });
      } else {
        if (connectedAddress) {
          const data = await joinGame(id as string, connectedAddress);
          if (data.success) {
            dispatch({ type: "SET_PLAYER", payload: true });
            dispatch({ type: "SET_GAME", payload: data.game });
            dispatch({ type: "SET_TOKEN", payload: data.token });
            dispatch({ type: "SET_PLAYER_DATA", payload: data.player });
          } else {
            router.push(`/`);
          }
        }
      }
    };

    loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress, id]);

  const moveToNextRound = async (address: string, won: boolean) => {
    if (state.game) await updatePlayerRound(state.game._id, state.token, address, won);
  };

  if (state.game?.status === "finished") {
    if (client.connection.state == "connected") client.close();
    return <Results game={state.game as Game} connectedAddress={connectedAddress || ""} />;
  } else if (state.isHost && state.game) {
    return (
      <Host
        game={state.game as Game}
        token={state.token}
        isUpdatingRound={state.isUpdatingRound}
        updateRoundCountdown={state.updateRoundCountdown}
        pauseAtRoundsEnd={state.pauseAtRoundsEnd}
        showRoundCountdown={state.showRoundCountdown}
        dispatch={dispatch}
      />
    );
  } else if (state.isPlayer && state.game && state.game.status === "lobby") {
    return <Lobby game={state.game as Game} connectedAddress={connectedAddress || ""} />;
  } else if (state.isPlayer && state.game) {
    return (
      <AnimatePresence initial={false}>
        {state.showRoundCountdown && state.game.status == "ongoing" ? (
          <RoundCountdown game={state.game} nextRoundCountdown={state.nextRoundCountdown} />
        ) : state.game.status == "paused" ? (
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
            game={state.game as Game}
            moveToNextRound={moveToNextRound}
            player={state.player as playerType}
            isUpdatingRound={state.isUpdatingRound}
            updateRoundCountdown={state.updateRoundCountdown}
            token={state.token}
            showRoundCountdown={state.showRoundCountdown}
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
