import React from "react";
import Image from "next/image";
import { Game } from "~~/types/game/game";
import { isGuessCorrect } from "~~/utils/doodleExchange/helpersClient";

type drawingListInfo = {
  drawingLink: string;
  drawWord: string;
  gptGuess: string;
};

function getAllDrawings(game: Game): drawingListInfo[] {
  const allDrawings: drawingListInfo[] = [];

  game.players.forEach(player => {
    player.rounds.forEach(round => {
      round.drawings.forEach(drawing => {
        if (drawing.includes("%2F")) {
          allDrawings.push({
            drawingLink: drawing,
            drawWord: drawing.split("%2F")[0].split("/o/")[1],
            gptGuess: drawing.split("%2F")[1],
          });
        }
      });
    });
  });

  if (game?.status === "finished") {
    return allDrawings;
  }

  return allDrawings.filter(
    drawingsInfo => !isGuessCorrect(game?.wordsList[game?.currentRound], drawingsInfo?.gptGuess),
  );
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
            {drawingsList.reverse().map((drawingInfo, index) => (
              <div key={index} className="border border-neutral-400">
                <div>
                  <Image src={drawingInfo?.drawingLink} alt={`Drawing ${index + 1}`} width={200} height={200} />
                </div>
                <p className="text-center my-0">{drawingInfo?.gptGuess}</p>
              </div>
            ))}
          </div>
        </div>
      )}{" "}
    </>
  );
};

export default DrawingsList;
