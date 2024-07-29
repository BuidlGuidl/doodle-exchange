import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import CopyToClipboard from "react-copy-to-clipboard";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { Game } from "~~/types/game/game";
import { updateGameStatus } from "~~/utils/doodleExchange/api/apiUtils";

const Host = ({ game, token }: { game: Game; token: string }) => {
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

  return (
    <div className="p-6">
      <h1>Host</h1>
      <div className=" bg-base-200 mt-2 rounded-md">
        <div className="flex">
          <span>Copy Invite Url</span>
          {inviteUrlCopied ? (
            <CheckCircleIcon
              className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
              aria-hidden="true"
            />
          ) : (
            <CopyToClipboard
              text={inviteUrl?.toString() || ""}
              onCopy={() => {
                setInviteUrlCopied(true);
                setTimeout(() => {
                  setInviteUrlCopied(false);
                }, 800);
              }}
            >
              <DocumentDuplicateIcon
                className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                aria-hidden="true"
              />
            </CopyToClipboard>
          )}
        </div>
        <div>
          <QRCode value={inviteUrl?.toString() || ""} className="" level="H" renderAs="svg" />
        </div>
        <div className="flex mt-2">
          <span>Invite: {game.inviteCode}</span>
          {inviteCopied ? (
            <CheckCircleIcon
              className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
              aria-hidden="true"
            />
          ) : (
            <CopyToClipboard
              text={game.inviteCode}
              onCopy={() => {
                setInviteCopied(true);
                setTimeout(() => {
                  setInviteCopied(false);
                }, 800);
              }}
            >
              <DocumentDuplicateIcon
                className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
                aria-hidden="true"
              />
            </CopyToClipboard>
          )}
        </div>
      </div>
      <button
        className="btn btn-sm btn-primary my-2"
        onClick={() => {
          updateGameStatus(game._id, "ongoing", token);
        }}
      >
        Start Game
      </button>
      <h1>Lobby {game.players.length}</h1>
      {game.players.map(player => {
        return <h1 key={player}>{player}</h1>;
      })}
    </div>
  );
};

export default Host;
