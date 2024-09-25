"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import Results from "~~/app/game/_components/Results";
import { Game } from "~~/types/game/game";
import { notification } from "~~/utils/scaffold-eth";

const ResultsPage = () => {
  const { id } = useParams();
  const { address: connectedAddress } = useAccount();
  const router = useRouter();

  const [game, setGame] = useState<Game>();

  useEffect(() => {
    const loadGame = async () => {
      const response = await fetch(`/api/game/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();
      if (responseData.error) {
        router.push(`/`);
        notification.error(responseData.error);
        return;
      }
      setGame(responseData);
    };

    loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress, id]);

  if (game?.status === "finished") {
    return <Results game={game as Game} connectedAddress={connectedAddress || ""} />;
  } else {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
        <span className="loading loading-ball loading-xs"></span>
        <span className="loading loading-ball loading-sm"></span>
        <span className="loading loading-ball loading-md"></span>
        <span className="loading loading-ball loading-lg"></span>
      </div>
    );
  }
};

export default ResultsPage;
