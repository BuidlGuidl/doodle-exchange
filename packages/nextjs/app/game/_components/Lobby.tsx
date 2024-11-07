import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { UserIcon } from "@heroicons/react/24/outline";
import CopyButton from "~~/app/_components/CopyButton";
import UserCard from "~~/app/_components/UserCard";
import { Game } from "~~/types/game/game";

const Lobby = ({ game, connectedAddress }: { game: Game; connectedAddress: string }) => {
  const [inviteUrl, setInviteUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUrl = window.location.href;
      setInviteUrl(currentUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-center bg-base-200 mt-2 rounded-md">
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
      <h1 className="flex justify-center text-2xl mt-5">Waiting host to start</h1>
      <div className="flex flex-wrap gap-2 justify-center items-center max-w-2xl mx-auto">
        {game.players.map(player => {
          return (
            <span key={player.address} className="flex">
              <UserCard
                address={player?.address}
                username={player?.userName}
                className={`${player?.address === connectedAddress ? "bg-primary" : "bg-secondary"} rounded-full p-2 flex items-center shadow-md`}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default Lobby;
