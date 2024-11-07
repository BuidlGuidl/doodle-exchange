// components/CountdownOverlay.jsx
import Leaderboard from "./Leaderboard";
import { motion as m } from "framer-motion";
import { Game } from "~~/types/game/game";

const RoundCountdown = ({ game, nextRoundCountdown }: { game: Game; nextRoundCountdown: number }) => {
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
      <div className="text-white text-7xl font-semibold animate-ping-1000">
        {nextRoundCountdown <= 0 ? "GO!" : nextRoundCountdown}
      </div>
      <div className="flex w-fit mt-24 md:justify-end justify-center md:fixed md:right-5 md:bottom-12">
        <Leaderboard game={game} />
      </div>
    </m.div>
  );
};

export default RoundCountdown;
