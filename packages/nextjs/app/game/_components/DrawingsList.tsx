import React from "react";
import Image from "next/image";
import { Game } from "~~/types/game/game";

function getAllDrawings(game: Game): string[] {
  const allDrawings: string[] = [];

  game.players.forEach(player => {
    player.rounds.forEach(round => {
      allDrawings.push(...round.drawings);
    });
  });

  return allDrawings;
}

const DrawingsList = ({ game }: { game: Game }) => {
  const drawingsList = getAllDrawings(game);
  console.log(game);
  console.log(drawingsList);
  return (
    <>
      {drawingsList.length > 0 && (
        <div>
          <h1>Drawings</h1>
          <div className="flex flex-wrap gap-2">
            {drawingsList.reverse().map((drawing, index) => (
              <div key={index} className="border border-neutral-400">
                <div>
                  <Image src={drawing} alt={`Drawing ${index + 1}`} width={200} height={200} />
                </div>
                <p className="text-center my-0">{drawing.includes("%2F") && drawing.split("%2F")[1]}</p>
              </div>
            ))}
          </div>
        </div>
      )}{" "}
    </>
  );
};

export default DrawingsList;
