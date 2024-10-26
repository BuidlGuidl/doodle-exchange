import React, { useState } from "react";
import Image from "next/image";
import ImageModal from "./ImageModal";
import { loogieBlo } from "loogie-blo";
import { useAccount } from "wagmi";

const Leaderboard = () => {
  const { address } = useAccount();
  const [showImage, setShowImage] = useState<string>("");
  const topPlayers = [
    { address: "0000", userName: "hi", drawingLink: "", Score: "10" },
    { address: "0000", userName: "321321", drawingLink: "", Score: "10" },
    { address: "0000", userName: "fdsa", drawingLink: "", Score: "10" },
    { address: "0000", userName: "323213", drawingLink: "", Score: "10" },
    { address: "0000", userName: "asdfdsafasdfdsaklfjsa lkjl32132131321", drawingLink: "", Score: "10" },
  ];

  return (
    <div className="mt-5">
      <table className="table max-w-[12rem] shadow-lg">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th className="pl-5">Score</th>
            <th className="pl-5">Drawing</th>
          </tr>
        </thead>
        <tbody>
          {topPlayers.map((player: any, index: number) => (
            <tr key={index} className={player.address === address ? "bg-base-300" : ""}>
              <td>{index + 1}</td>
              <td className="flex w-fit">
                <Image
                  alt={player.address + " loogie"}
                  src={loogieBlo(player.address as `0x${string}`)}
                  width={20}
                  height={20}
                  className="rounded-full"
                />

                {player.userName}
              </td>
              <td className="pl-5">{player.Score}</td>
              <td className="pl-5">
                <button className="btn btn-xs btn-secondary" onClick={() => setShowImage(player?.drawingLink)}>
                  View
                </button>
              </td>
            </tr>
          ))}
          <ImageModal
            showImage={showImage}
            closeModal={() => {
              setShowImage("");
            }}
          />
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
