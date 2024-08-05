import React from "react";
import { useRouter } from "next/navigation";
import { Game } from "~~/types/game/game";

const Results = ({ game }: { game: Game }) => {
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

        {game?.winners &&
          game?.winners.map((winner, index) => {
            return (
              <h1 key={`${winner}_${index}`} className="mx-auto">
                The Round {index + 1} winner is {winner}
              </h1>
            );
          })}
      </div>
    </div>
  );
};

export default Results;
