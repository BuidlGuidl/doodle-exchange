import React, { useEffect, useState } from "react";
import Image from "next/image";
import ImageModal from "./ImageModal";
import { loogieBlo } from "loogie-blo";
import { useAccount } from "wagmi";
import { PlayerResult } from "~~/types/dailyDoodles/dailyDoodles";
import { getTodaysResults } from "~~/utils/doodleExchange/dailyDoodle/utils";

const Leaderboard = () => {
  const { address } = useAccount();
  const [imagesWithScores, setImagesWithScores] = useState<{ drawingLink: string; score: number }[]>([]);
  const [leaderboard, setLeaderboard] = useState<PlayerResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getLeaderboard = async () => {
      const results: PlayerResult[] = (await getTodaysResults()) as unknown as PlayerResult[];
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
              <td className="pl-5">{Math.max(...playerResult.score)}</td>
              <td className="pl-5">
                <button
                  className="btn btn-xs btn-secondary"
                  onClick={() => {
                    const combinedResults = playerResult.drawingLink.map((link, index) => ({
                      drawingLink: link,
                      score: playerResult.score[index], // Assuming score and drawingLink are aligned by index
                    }));
                    const sortedResults = combinedResults.sort((a, b) => b.score - a.score);
                    setImagesWithScores(sortedResults);
                  }}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ImageModal
        imagesWithScores={imagesWithScores}
        closeModal={() => {
          setImagesWithScores([]);
        }}
      />
    </div>
  );
};

export default Leaderboard;
