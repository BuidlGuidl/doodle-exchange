import React, { MutableRefObject, useEffect, useRef } from "react";
import Image from "next/image";
import { loogieBlo } from "loogie-blo";
import { Game } from "~~/types/game/game";
import { BANNED_WORDS } from "~~/utils/constants";
import { getTimeAgo } from "~~/utils/doodleExchange/game";

// type DrawingListInfo = {
//   drawingLink: string;
//   drawWord: string;
//   gptGuess: string;
//   isCorrect: boolean;
//   drawerUsername: string;
//   drawerAddress: string;
// };

// function getAllDrawings(game: Game): { [key: string]: DrawingListInfo[] } {
//   return game.players.reduce(
//     (drawings, player) => {
//       player.rounds.forEach(round => {
//         round.drawings.forEach(drawing => {
//           if (drawing.includes("%2F")) {
//             const [drawWordRaw, gptGuessRaw] = drawing.split("%2F");
//             const drawWord = drawWordRaw.split("/o/")[1].toLowerCase();
//             const gptGuess = gptGuessRaw.toLowerCase();

//             if (!drawings[drawWord]) {
//               drawings[drawWord] = [];
//             }

//             drawings[drawWord].push({
//               drawingLink: drawing,
//               drawWord,
//               gptGuess,
//               isCorrect: drawWord === gptGuess,
//               drawerAddress: player?.address,
//               drawerUsername: player?.userName,
//             });
//           }
//         });
//       });
//       return drawings;
//     },
//     {} as { [key: string]: DrawingListInfo[] },
//   );
// }

// const DrawingSection = ({
//   round,
//   drawings,
//   correct,
// }: {
//   round: number;
//   drawings: DrawingListInfo[];
//   correct: boolean;
// }) => (
//   <>
//     <h2>
//       Round {round} ({correct ? "Correct" : "Incorrect"})
//     </h2>
//     <div className="flex flex-wrap gap-2 mb-2">
//       {drawings.map((drawingInfo, index) => (
//         <div key={index} className="border border-neutral-400">
//           <Image src={drawingInfo.drawingLink} alt={`Drawing ${index + 1}`} width={200} height={200} />
//           <p className="flex justify-center my-0">
//             {drawingInfo.gptGuess}
//             <Image
//               alt={drawingInfo?.drawerAddress + " loogie"}
//               src={loogieBlo(drawingInfo?.drawerAddress as `0x${string}`)}
//               width={25}
//               height={25}
//               className="rounded-full"
//             />
//           </p>
//         </div>
//       ))}
//     </div>
//   </>
// );

const DrawingsList = ({ game }: { game: Game }) => {
  // const drawingsList = useMemo(() => getAllDrawings(game), [game]);

  const endRef: MutableRefObject<null> = useRef(null);

  // console.log(drawingsList);

  const scrollHandler = () => {
    setTimeout(() => {
      if (endRef.current && game.drawings.length > 2) {
        (endRef.current as HTMLElement).scrollIntoView({ behavior: "smooth" });
      }
    }, 500);
  };

  useEffect(() => {
    scrollHandler();
  });

  // return (
  //   <>
  //     {game.wordsList
  //       .slice()
  //       .reverse()
  //       .map((word, index) => {
  //         const roundNumber = game?.totalRounds - index;
  //         const drawingsForWord = drawingsList[word.toLowerCase()] || [];

  //         const correctDrawings = drawingsForWord.filter(drawing => drawing.isCorrect);
  //         const incorrectDrawings = drawingsForWord.filter(drawing => !drawing.isCorrect);

  //         const showRound = game.status === "finished" || word !== game?.wordsList[game?.currentRound];

  //         return (
  //           <div key={roundNumber}>
  //             {showRound && correctDrawings.length > 0 && (
  //               <DrawingSection round={roundNumber} drawings={correctDrawings} correct={true} />
  //             )}
  //             {incorrectDrawings.length > 0 && (
  //               <DrawingSection round={roundNumber} drawings={incorrectDrawings} correct={false} />
  //             )}
  //           </div>
  //         );
  //       })}
  //   </>
  // );

  return (
    <div className="flex flex-col gap-4 items-center h-[75vh] max-w-md py-4 overflow-y-auto">
      {game &&
        game.drawings &&
        game.drawings
          .filter(drawing => !BANNED_WORDS.includes(drawing.gptGuess))
          .map(drawing => (
            <div key={drawing.link} className="flex flex-col gap-1 items-center text-xs text-center w-full px-6">
              <div className="bg-base-100 flex flex-col items-center rounded-xl px-4 pt-4 pb-2 shadow-xl border-2 w-full">
                <div>
                  {drawing.isCorrect ? (
                    <div>
                      <h1>
                        {drawing.userName} submitted a correct drawing for {drawing.drawWord}
                        {drawing.round + 1 == game.totalRounds
                          ? " and has finished the last round"
                          : ` and has moved to round ${drawing.round + 2}`}
                      </h1>
                    </div>
                  ) : (
                    <div>
                      <h1>
                        {drawing.userName} submitted a {drawing.gptGuess} drawing for {drawing.drawWord}
                      </h1>
                    </div>
                  )}
                </div>
                <Image src={drawing.link} alt={`Drawing`} width={200} height={200} />
                <div className="flex justify-between w-full mx-6 items-center">
                  <Image
                    alt={drawing.address + " loogie"}
                    src={loogieBlo(drawing.address as `0x${string}`)}
                    width={25}
                    height={25}
                    className="rounded-full"
                  />
                  <span> {drawing.gptGuess}</span>
                  <span>{drawing.isCorrect ? "✔️" : "❌"}</span>
                </div>
              </div>
              <div className="flex w-full justify-end text-xs pr-2">{getTimeAgo(drawing.timeStamp)}</div>
            </div>
          ))}
      {game.status == "finished" && <div className="w-fit ml-auto mr-6">Game Finished!!</div>}
      <div ref={endRef} />
    </div>
  );
};
export default DrawingsList;
