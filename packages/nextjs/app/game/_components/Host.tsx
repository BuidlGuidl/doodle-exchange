import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import DrawingsList from "./DrawingsList";
import QRCode from "qrcode.react";
import { PlayIcon, PlayPauseIcon, UserIcon } from "@heroicons/react/24/outline";
import CopyButton from "~~/app/_components/CopyButton";
import UserCard from "~~/app/_components/UserCard";
import { Game } from "~~/types/game/game";
import { updateGameStatus } from "~~/utils/doodleExchange/api/apiUtils";
import { notification } from "~~/utils/scaffold-eth";

const Host = ({
  game,
  token,
  isUpdatingRound,
  countdown,
  pauseAtRoundsEnd,
  setPauseAtRoundsEnd,
}: {
  game: Game;
  token: string;
  isUpdatingRound: boolean;
  countdown: number;
  showCountdown: boolean;
  pauseAtRoundsEnd: boolean;
  setPauseAtRoundsEnd: Dispatch<SetStateAction<boolean>>;
}) => {
  const [inviteUrl, setInviteUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUrl = window.location.href;
      setInviteUrl(currentUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 flex flex-col items-center overflow-hidden max-w-3xl mx-auto">
      <div className="flex flex-col items-center justify-center">
        {game?.status === "lobby" && (
          <>
            <h1 className="text-3xl">Host</h1>
            <div className="flex justify-center bg-base-200 mt-2 rounded-md p-4">
              <div className="flex flex-col items-end mr-5">
                <span className="flex">
                  Copy Invite Url <CopyButton textToCopy={inviteUrl} />
                </span>
                <span className="flex">Rounds: {game?.totalRounds}</span>
                <span className="flex text-sky-600 text-xl items-center ">
                  <UserIcon className="text-sky-600 h-5 w-5 justify-center items-center" />: {game.players.length}
                </span>
              </div>
              <div>
                <QRCode value={inviteUrl?.toString() || ""} className="" level="H" renderAs="svg" />
              </div>
              <div className="flex mt-2"></div>
            </div>
          </>
        )}
        <div className="fixed bottom-0 right-5 flex flex-col items-end">
          <div className="h-6 ">
            {isUpdatingRound &&
              (game.currentRound === game.totalRounds - 1
                ? `Ending the game in ${countdown} Seconds`
                : `This round ends in ${countdown} Seconds`)}
          </div>
          <button
            className="btn btn-sm btn-primary my-4 w-fit "
            onClick={() => {
              if (game.status == "paused") {
                updateGameStatus(game._id, "ongoing", token);
              } else {
                setPauseAtRoundsEnd(true);
                notification.info(`Game will pause and the end of this round`);
              }
            }}
            disabled={pauseAtRoundsEnd || game.currentRound + 1 == game.totalRounds}
          >
            <PlayPauseIcon className=" h-5 w-5 " />
            {game.status === "paused" ? (
              "Resume"
            ) : (
              <span className="flex items-center">{pauseAtRoundsEnd && <span className="loading mr-1" />}Pause</span>
            )}
          </button>
        </div>
        {game?.status === "lobby" ? (
          <>
            <button
              className="btn btn-sm btn-primary my-4"
              onClick={() => updateGameStatus(game._id, "ongoing", token)}
            >
              <PlayIcon className=" h-5 w-5" /> Start
            </button>
            <div className="flex flex-wrap gap-2 justify-center items-center max-w-2xl mx-auto">
              {game.players.map(player => {
                return (
                  <span key={player.address} className="flex">
                    <UserCard
                      address={player?.address}
                      username={player?.userName}
                      className={`bg-secondary rounded-full btn-sm flex items-center my-0 shadow-md gap-0`}
                    />
                  </span>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl">Game Word</h1>
            <h1 className="flex justify-center w-full items-center">
              <span className="w-20">Round {game.currentRound + 1}: </span>
              <span className="">{game.wordsList[game.currentRound]}</span>
            </h1>
            <div className="flex flex-wrap justify-center gap-x-1 gap-y-2 mx-auto mt-5 ">
              {game.players.map(player => (
                <UserCard
                  key={player.address}
                  address={player?.address}
                  username={player?.userName}
                  className="bg-secondary rounded-full flex items-center my-0 shadow-md p-1.5 w-max text-xs md:text-base"
                  status={player?.status}
                  round={player?.currentRound}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="mt-5">
        <DrawingsList game={game} />
      </div>
    </div>
  );
};

export default Host;

/** 
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import DrawingsList from "./DrawingsList";
import QRCode from "qrcode.react";
import { UserIcon } from "@heroicons/react/24/outline";
import CopyButton from "~~/app/_components/CopyButton";
import UserCard from "~~/app/_components/UserCard";
import { Game } from "~~/types/game/game";
import { updateGameStatus } from "~~/utils/doodleExchange/api/apiUtils";

const Host = ({
  game,
  token,
  isUpdatingRound,
  countdown,
  pauseAtRoundsEnd,
  setPauseAtRoundsEnd,
}: {
  game: Game;
  token: string;
  isUpdatingRound: boolean;
  countdown: number;
  showCountdown: boolean;
  setShowCountdown: Dispatch<SetStateAction<boolean>>;
  pauseAtRoundsEnd: boolean;
  setPauseAtRoundsEnd: Dispatch<SetStateAction<boolean>>;
}) => {
  const [inviteUrl, setInviteUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUrl = window.location.href;
      setInviteUrl(currentUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="flex md:flex-row flex-col items-center justify-center ">
        <div>
          <h1 className="text-3xl">Host</h1>
          <div className="flex justify-center bg-base-200 mt-2 rounded-md p-4">
            <div className="flex flex-col items-end mr-5">
              <span className="flex">
                Copy Invite Url <CopyButton textToCopy={inviteUrl} />
              </span>
              <span className="flex">Rounds: {game?.totalRounds}</span>
              <span className="flex text-sky-600 text-xl items-center ">
                <UserIcon className="text-sky-600 h-5 w-5 justify-center items-center" />: {game.players.length}
              </span>
            </div>
            <div>
              <QRCode value={inviteUrl?.toString() || ""} className="" level="H" renderAs="svg" />
            </div>
            <div className="flex mt-2"></div>
          </div>
        </div>
        <div className="flex md:flex-row gap-8">
          {game?.status === "lobby" ? (
            <>
              <button
                className="btn btn-sm btn-primary my-4"
                onClick={() => updateGameStatus(game._id, "ongoing", token)}
              >
                Start Game
              </button>
              <div className="flex flex-wrap gap-2 justify-center items-center max-w-2xl mx-auto">
                {game.players.map(player => {
                  return (
                    <span key={player.address} className="flex">
                      <UserCard
                        address={player?.address}
                        username={player?.userName}
                        className={`bg-secondary rounded-full btn-sm flex items-center my-0 shadow-md gap-0`}
                      />
                    </span>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-start">
                <h1>Game Words</h1>
                {game.wordsList.map((word, index) => (
                  <h1 key={index} className="flex flex-wrap justify-start w-full items-center">
                    <span className="w-20">Round {index + 1}: </span>
                    <span className={game?.status === "lobby" || index > game?.currentRound ? "blur-sm" : ""}>
                      {word}
                    </span>
                  </h1>
                ))}
              </div>
              <div className="flex flex-col gap-x-3 gap-y-2 mx-auto items-end mt-5">
                {game.players.map(player => (
                  <div key={player.address} className="flex gap-x-3 items-center">
                    <span className="flex">
                      <UserCard
                        address={player?.address}
                        username={player?.userName}
                        className="bg-secondary rounded-full btn-sm flex items-center my-0 shadow-md gap-0"
                      />
                    </span>
                    <span className="w-20"> {player.status}</span>
                    <span>Round: {player.currentRound + 1}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="fixed bottom-0 right-5 flex flex-col items-end">
        <div className="h-6 ">
          {isUpdatingRound &&
            (game.currentRound === game.totalRounds - 1
              ? `Ending the game in ${countdown} Seconds`
              : `This round ends in ${countdown} Seconds`)}
        </div>
        <button
          className="btn btn-sm btn-primary my-4 w-fit "
          onClick={() => {
            game.status === "paused" ? updateGameStatus(game._id, "ongoing", token) : setPauseAtRoundsEnd(true);
          }}
          disabled={pauseAtRoundsEnd}
        >
          {game.status === "paused" ? (
            "Resume"
          ) : (
            <span className="flex items-center">
              {pauseAtRoundsEnd && <span className="loading mr-1" />}Pause at round&apos;s end
            </span>
          )}
        </button>
      </div>
      <div className="px-10 mt-5">
        <DrawingsList game={game} />
      </div>
    </div>
  );
};

export default Host;


*/
