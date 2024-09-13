import React, { useMemo } from "react";
import Image from "next/image";
import { loogieBlo } from "loogie-blo";
import { Game } from "~~/types/game/game";

type DrawingListInfo = {
  drawingLink: string;
  drawWord: string;
  gptGuess: string;
  isCorrect: boolean;
  drawerUsername: string;
  drawerAddress: string;
};

function getAllDrawings(game: Game): { [key: string]: DrawingListInfo[] } {
  return game.players.reduce(
    (drawings, player) => {
      player.rounds.forEach(round => {
        round.drawings.forEach(drawing => {
          if (drawing.includes("%2F")) {
            const [drawWordRaw, gptGuessRaw] = drawing.split("%2F");
            const drawWord = drawWordRaw.split("/o/")[1].toLowerCase();
            const gptGuess = gptGuessRaw.toLowerCase();

            if (!drawings[drawWord]) {
              drawings[drawWord] = [];
            }

            drawings[drawWord].push({
              drawingLink: drawing,
              drawWord,
              gptGuess,
              isCorrect: drawWord === gptGuess,
              drawerAddress: player?.address,
              drawerUsername: player?.userName,
            });
          }
        });
      });
      return drawings;
    },
    {} as { [key: string]: DrawingListInfo[] },
  );
}

const DrawingSection = ({
  round,
  drawings,
  correct,
}: {
  round: number;
  drawings: DrawingListInfo[];
  correct: boolean;
}) => (
  <>
    <h2>
      Round {round} ({correct ? "Correct" : "Incorrect"})
    </h2>
    <div className="flex flex-wrap gap-2 mb-2">
      {drawings.map((drawingInfo, index) => (
        <div key={index} className="border border-neutral-400">
          <Image src={drawingInfo.drawingLink} alt={`Drawing ${index + 1}`} width={200} height={200} />
          <p className="flex justify-center  inline my-0">
            {drawingInfo.gptGuess}
            <Image
              alt={drawingInfo?.drawerAddress + " loogie"}
              src={loogieBlo(drawingInfo?.drawerAddress as `0x${string}`)}
              width={25}
              height={25}
              className="rounded-full"
            />
          </p>
        </div>
      ))}
    </div>
  </>
);

const DrawingsList = ({ game }: { game: Game }) => {
  const drawingsList = useMemo(() => getAllDrawings(game), [game]);
  console.log(game);
  console.log(drawingsList);
  return (
    <>
      {game.wordsList
        .slice()
        .reverse()
        .map((word, index) => {
          const roundNumber = game?.totalRounds - index;
          const drawingsForWord = drawingsList[word.toLowerCase()] || [];

          const correctDrawings = drawingsForWord.filter(drawing => drawing.isCorrect);
          const incorrectDrawings = drawingsForWord.filter(drawing => !drawing.isCorrect);

          const showRound = game.status === "finished" || word !== game?.wordsList[game?.currentRound];

          return (
            <div key={roundNumber}>
              {showRound && correctDrawings.length > 0 && (
                <DrawingSection round={roundNumber} drawings={correctDrawings} correct={true} />
              )}
              {incorrectDrawings.length > 0 && (
                <DrawingSection round={roundNumber} drawings={incorrectDrawings} correct={false} />
              )}
            </div>
          );
        })}
    </>
  );
};

export default DrawingsList;
