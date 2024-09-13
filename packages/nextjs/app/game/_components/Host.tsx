import React, { useEffect, useState } from "react";
import DrawingsList from "./DrawingsList";
import QRCode from "qrcode.react";
import CopyToClipboard from "react-copy-to-clipboard";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import UserCard from "~~/app/_components/UserCard";
// import { Address } from "~~/components/scaffold-eth";
import { Game } from "~~/types/game/game";
import { updateGameStatus } from "~~/utils/doodleExchange/api/apiUtils";

const Host = ({
  game,
  token,
  isUpdatingRound,
  countdown,
}: {
  game: Game;
  token: string;
  isUpdatingRound: boolean;
  countdown: number;
}) => {
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteUrlCopied, setInviteUrlCopied] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUrl = window.location.href;
      setInviteUrl(currentUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (setCopied: (copied: boolean) => void) => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 800);
  };

  return (
    <div className="p-6">
      <h1>Host</h1>
      <div className="bg-base-200 mt-2 rounded-md">
        <div className="flex items-center">
          <span>Copy Invite Url</span>
          {inviteUrlCopied ? (
            <CheckCircleIcon className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5" aria-hidden="true" />
          ) : (
            <CopyToClipboard text={inviteUrl || ""} onCopy={() => handleCopy(setInviteUrlCopied)}>
              <DocumentDuplicateIcon
                className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                aria-hidden="true"
              />
            </CopyToClipboard>
          )}
        </div>
        <div>
          <QRCode value={inviteUrl || ""} className="" level="H" renderAs="svg" />
        </div>
        <div className="flex mt-2 items-center">
          <span>Invite: {game.inviteCode}</span>
          {inviteCopied ? (
            <CheckCircleIcon className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5" aria-hidden="true" />
          ) : (
            <CopyToClipboard text={game.inviteCode} onCopy={() => handleCopy(setInviteCopied)}>
              <DocumentDuplicateIcon
                className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                aria-hidden="true"
              />
            </CopyToClipboard>
          )}
        </div>
      </div>
      <div className="h-6">
        {isUpdatingRound &&
          (game.currentRound === game.totalRounds - 1
            ? `Ending the game in ${countdown} Seconds`
            : `This round ends in ${countdown} Seconds`)}
      </div>
      {game?.status === "lobby" && (
        <button className="btn btn-sm btn-primary my-2" onClick={() => updateGameStatus(game._id, "ongoing", token)}>
          Start Game
        </button>
      )}
      <h1>Game Words</h1>
      {game.wordsList.map((word, index) => (
        <h1 key={index} className="flex gap-6 justify-between w-fit items-center">
          <span>
            Round {index + 1}:{" "}
            <span className={game?.status === "lobby" || index > game?.currentRound ? "blur-sm" : ""}>{word}</span>
          </span>
        </h1>
      ))}
      <div className="mb-5"></div>
      <h1>Lobby {game.players.length}</h1>
      {game.players.map(player => (
        <h1 key={player.address} className="flex gap-6 justify-between w-fit items-center">
          <span className="flex">
            <UserCard
              address={player?.address}
              username={player?.userName}
              className="bg-secondary rounded-full btn-sm flex items-center pl-0 my-0 pr-2 shadow-md gap-0"
            />
          </span>
          <span className="w-24"> {player.status}</span>
          <span>Round: {player.currentRound + 1}</span>
        </h1>
      ))}
      {<DrawingsList game={game} />}
    </div>
  );
};

export default Host;
