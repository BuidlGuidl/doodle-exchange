"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Host from "../_components/Host";
import Player from "../_components/Player";
import Ably from "ably";
import { useAccount } from "wagmi";
import doodleConfig from "~~/doodle.config";
import useGameData from "~~/hooks/doodleExchange/useGameData";
import { Game } from "~~/types/game/game";
import { joinGame } from "~~/utils/doodleExchange/api/apiUtils";

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
      if (game && game.game) {
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

  if (isHost && game) {
    return <Host game={game as Game} token={token} />;
  } else if (isPlayer && game) {
    return <Player game={game as Game} />;
  } else {
    return (
      <div className="p-4">
        <h1>Loading...</h1>
      </div>
    );
  }
};

export default GamePage;
