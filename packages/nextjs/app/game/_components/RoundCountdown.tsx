// components/CountdownOverlay.jsx
import { useEffect, useState } from "react";
import Leaderboard from "./Leaderboard";
import { motion as m } from "framer-motion";
import { Game } from "~~/types/game/game";

const RoundCountdown = ({ game, onCountdownEnd }: { game: Game; onCountdownEnd: () => void }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: any;
    if (countdown >= 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else {
      onCountdownEnd();
    }

    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <m.div
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-0 flex flex-col gap-2 items-center justify-center bg-black bg-opacity-30 z-50"
    >
      <div className="text-white text-xl font-semibold">
        {/* {game.currentRound == 0 ? "Game starts in" : "Waiting for next round"} */}
        Game round starts in
      </div>
      <div className="text-white text-7xl font-semibold animate-ping-1000">{countdown <= 0 ? "GO!" : countdown}</div>
      <div className="flex w-fit mt-24 md:justify-end justify-center md:fixed md:right-5 md:bottom-12">
        <Leaderboard game={game} />
      </div>
    </m.div>
  );
};

export default RoundCountdown;
