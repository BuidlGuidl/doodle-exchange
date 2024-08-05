"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Host from "../_components/Host";
import Lobby from "../_components/Lobby";
import Player from "../_components/Player";
import Results from "../_components/Results";
import Ably from "ably";
import { useAccount } from "wagmi";
import doodleConfig from "~~/doodle.config";
import useGameData from "~~/hooks/doodleExchange/useGameData";
import { Game } from "~~/types/game/game";
import { joinGame, updateGameRound, updateGameStatus } from "~~/utils/doodleExchange/api/apiUtils";

const GamePage = () => {
  const ablyApiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY || doodleConfig.ably_api_key;
  const { id } = useParams();
  const { loadGameState, updateGameState } = useGameData();
  const { address: connectedAddress } = useAccount();
  const [isHost, setIsHost] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);

  const [game, setGame] = useState<Game>();
  const [token, setToken] = useState("");

  useEffect(() => {
    const loadGame = async () => {
      const game = loadGameState();
      if (game && game.game && game.game.inviteCode === id) {
        const { token, game: gameState } = game;
        if (connectedAddress === gameState.hostAddress) setIsHost(true);
        if (gameState.players.includes(connectedAddress)) setIsPlayer(true);
        setGame(gameState);
        setToken(token);
      } else {
        if (connectedAddress) {
          await joinGame(id as string, connectedAddress);
          setIsPlayer(true);
        }
      }
    };

    loadGame();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress, id]);

  useEffect(() => {
    if (!game && isPlayer) {
      const game = loadGameState();
      if (game && game.game) {
        const { token, game: gameState } = game;
        setGame(gameState);
        setToken(token);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayer]);

  useEffect(() => {
    if (!ablyApiKey) return;
    const ably = new Ably.Realtime({ key: ablyApiKey });
    const channel = ably.channels.get(`gameUpdate`);

    channel.subscribe(message => {
      if (game?._id === message.data._id) {
        setGame(message.data);
        updateGameState(JSON.stringify(message.data));
      }
    });

    return () => {
      channel.unsubscribe(`gameUpdate`);
      ably.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, ablyApiKey]);

  const moveToNextRound = (winner: string) => {
    if (game) updateGameRound(game._id, game?.currentRound + 1, token, winner);
  };

  const finishGame = async () => {
    if (game) await updateGameStatus(game._id, "finished", token);
  };
  if (game && game?.status === "finished") {
    return <Results game={game as Game} />;
  } else if (isHost && game) {
    return <Host game={game as Game} token={token} />;
  } else if (isPlayer && game && game?.status == "lobby") {
    return <Lobby game={game as Game} />;
  } else if (isPlayer && game) {
    return <Player game={game as Game} moveToNextRound={moveToNextRound} finishGame={finishGame} />;
  } else {
    return (
      <div className="p-4">
        <h1>Loading...</h1>
      </div>
    );
  }
};

export default GamePage;
