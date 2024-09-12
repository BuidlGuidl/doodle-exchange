import React, { useEffect, useState } from "react";
import Image from "next/image";
import { loogieBlo } from "loogie-blo";
import { useAccount } from "wagmi";
import { Game } from "~~/types/game/game";
import { getTopPlayers } from "~~/utils/doodleExchange/game";

const Leaderboard = ({ game }: { game: Game }) => {
  const { address } = useAccount();
  const [topPlayers, setTopPlayers] = useState<any>([]);

  useEffect(() => {
    if (address) {
      const topPlayers = getTopPlayers(game, address as string);
      setTopPlayers(topPlayers);
    }
  }, [game, address]);

  return (
    <div className="">
      <table className="table max-w-[12rem] shadow-lg">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th className="pl-5">Points</th>
          </tr>
        </thead>
        <tbody>
          {topPlayers.map((player: any) => (
            <tr key={player.address} className={player.address === address ? "bg-base-300" : ""}>
              <td>{player.rank}</td>
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
              <td className="pl-5">{player.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
