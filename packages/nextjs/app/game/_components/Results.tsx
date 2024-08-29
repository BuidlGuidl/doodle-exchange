import React from "react";
import { useRouter } from "next/navigation";
import DrawingsList from "./DrawingsList";
import { Address } from "~~/components/scaffold-eth";
import { Game } from "~~/types/game/game";

const getFinalResults = (game: Game) => {
  const playersScore = new Map();
  game?.players.forEach(player => {
    playersScore.set(player?.address, 0);
  });
  game?.winners.forEach(winners => {
    winners.forEach((winner, index) => {
      if (playersScore.has(winner)) {
        const newScore = index == 0 ? 3 : 1;
        playersScore.set(winner, playersScore.get(winner) + newScore);
      } else {
        playersScore.set(winner, index == 0 ? 3 : 1);
      }
    });
  });
  return playersScore;
};

const Results = ({ game, connectedAddress }: { game: Game; connectedAddress: string }) => {
  const router = useRouter();

  const playersScore = getFinalResults(game);

  return (
    <div className="p-6">
      <div className="flex flex-col justify-center">
        <div className="mx-auto mb-5">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              router.push("/");
            }}
          >
            Back to Home
          </button>
        </div>
        <h1 className="mx-auto text-2xl">Results</h1>
        <div className="flex flex-col h-36 overflow-y-scroll mx-auto">
          <li className="flex gap-6 justify-between">
            <span>Player</span>
            <span>Score</span>
          </li>
          {Array.from(playersScore.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([player, score], index) => {
              return (
                <li key={index} className="flex gap-6 justify-between">
                  <Address address={player} /> {player === connectedAddress && "(you)"}
                  <span>{score}</span>
                </li>
              );
            })}
        </div>

        <DrawingsList game={game} />
      </div>
    </div>
  );
};

export default Results;
