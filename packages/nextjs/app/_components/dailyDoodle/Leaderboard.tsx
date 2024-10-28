import React, { useEffect, useState } from "react";
import Image from "next/image";
import ImageModal from "./ImageModal";
import { loogieBlo } from "loogie-blo";
import { useAccount } from "wagmi";
import { PlayerResult } from "~~/types/dailyDoodles/dailyDoodles";
import { getTodaysResults } from "~~/utils/doodleExchange/dailyDoodle/utils";

const Leaderboard = () => {
  const { address } = useAccount();
  const [showImage, setShowImage] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<PlayerResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getLeaderboard = async () => {
      const results: PlayerResult[] = (await getTodaysResults()) as unknown as PlayerResult[];
      console.log(results);
      setLeaderboard(results);
      setIsLoading(false);
    };

    getLeaderboard();
  }, []);

  if (isLoading) {
    return <span className="flex flex-col m-auto loading loading-spinner loading-sm"></span>;
  }

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
          {leaderboard.map((playerResult: PlayerResult, index: number) => (
            <tr key={index} className={playerResult.address === address ? "bg-base-300" : ""}>
              <td>{index + 1}</td>
              <td className="flex w-fit">
                <Image
                  alt={playerResult.address + " loogie"}
                  src={loogieBlo(playerResult.address as `0x${string}`)}
                  width={20}
                  height={20}
                  className="rounded-full"
                />

                {playerResult.userName}
              </td>
              <td className="pl-5">{playerResult.score}</td>
              <td className="pl-5">
                <button className="btn btn-xs btn-secondary" onClick={() => setShowImage(playerResult?.drawingLink)}>
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
