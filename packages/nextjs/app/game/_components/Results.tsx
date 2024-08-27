import React from "react";
import { useRouter } from "next/navigation";
import DrawingsList from "./DrawingsList";
import { Game } from "~~/types/game/game";

const Results = ({ game, connectedAddress }: { game: Game; connectedAddress: string }) => {
  const router = useRouter();

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
        {/* 
        {game.winners &&
          game.winners.map((winner, index) => {
            return (
              <h1 key={`${winner}_${index}`} className="mx-auto">
                The Round {index + 1} winner is {winner}
              </h1>
            );
          })} */}

        {game.winners.map((winners, index) => {
          return (
            <div key={index} className="flex flex-col h-36 overflow-y-scroll mx-auto">
              <h1>{`Round ${index + 1} Winners`}</h1>
              <ul>
                {winners.map((winner, index) => (
                  <li key={winner} className="flex gap-6 justify-between">
                    <span>
                      {winner} {winner === connectedAddress && "(you)"}
                    </span>
                    <span>{index == 0 ? "3" : "1"}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <DrawingsList game={game} />
      </div>
    </div>
  );
};

export default Results;
