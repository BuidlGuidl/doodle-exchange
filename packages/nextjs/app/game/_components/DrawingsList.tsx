import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Drawings, Game } from "~~/types/game/game";
import { BANNED_WORDS } from "~~/utils/constants";
import { getTimeAgo } from "~~/utils/doodleExchange/game";

const DrawingsList = ({ game }: { game: Game }) => {
  const endRef: MutableRefObject<null> = useRef(null);
  const [selectedRound, setSelectedRound] = useState(-1);
  const [drawings, setDrawings] = useState<Drawings[]>();

  // const scrollHandler = () => {
  //   setTimeout(() => {
  //     if (endRef.current && game.drawings.length > 2) {
  //       (endRef.current as HTMLElement).scrollIntoView({ behavior: "smooth" });
  //     }
  //   }, 500);
  // };

  // useEffect(() => {
  //   scrollHandler();
  // }, [drawings]);

  useEffect(() => {
    if (game && game.drawings) {
      const drawings = game.drawings.filter(drawing => {
        const isBanned = BANNED_WORDS.includes(drawing.gptGuess);
        const isRoundSelected = selectedRound !== -1;
        const isInSelectedRound = selectedRound === drawing.round;

        return isRoundSelected ? !isBanned && isInSelectedRound : !isBanned;
      });
      setDrawings(drawings);
    }
  }, [selectedRound, game.drawings]);

  return (
    <div className="flex flex-col gap-2 items-center h-[75vh] max-w-md py-4 ">
      {game && game.drawings && game.drawings.length > 0 && (
        <ul className="menu menu-horizontal activemenu justify-center py-2 gap-1 ">
          <li
            onClick={() => {
              setSelectedRound(-1);
            }}
          >
            <a className={selectedRound === -1 ? "active" : "bg-base-300"}>All</a>
          </li>
          {Array.from({ length: game.currentRound + 1 }, (_, i) => i).map(round => (
            <li
              key={round}
              onClick={() => {
                setSelectedRound(round);
              }}
            >
              <a className={selectedRound === round ? "active" : "bg-base-300"}>{game.wordsList[round]}</a>
            </li>
          ))}
        </ul>
      )}
      <div className="overflow-y-auto flex flex-col gap-3">
        {game &&
          drawings &&
          drawings.map(drawing => (
            <div key={drawing.link} className="flex flex-col gap-1 items-center text-xs text-center w-full px-6">
              <div
                className={`bg-base-100 flex flex-col items-center rounded-xl px-4 pt-4 pb-2 shadow-lg border-2 w-full ${drawing.isCorrect ? "shadow-green-300 border-green-200" : "shadow-red-300 border-red-200"}`}
              >
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
                <div className="flex justify-center w-full mx-6 items-center">
                  {/* <Image
                    alt={drawing.address + " loogie"}
                    src={loogieBlo(drawing.address as `0x${string}`)}
                    width={25}
                    height={25}
                    className="rounded-full"
                  /> */}
                  <span> {drawing.gptGuess}</span>
                  {/* <span>{drawing.isCorrect ? "✔️" : "❌"}</span> */}
                </div>
              </div>
              <div className="flex w-full justify-end text-xs pr-2">{getTimeAgo(drawing.timeStamp)}</div>
            </div>
          ))}
        {game.status == "finished" && <div className="w-fit ml-auto mr-6">Game Finished!!</div>}
        <div ref={endRef} />
      </div>
    </div>
  );
};
export default DrawingsList;
