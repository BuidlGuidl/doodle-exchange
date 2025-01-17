"use client";

import { useState } from "react";
import GameCreationForm from "./_components/GameCreateForm";
import SingleGame from "./_components/SingleGame";
import DailyDoodle from "./_components/dailyDoodle/DailyDoodle";
import type { NextPage } from "next";
import { useAccount } from "wagmi";

type gameStateType = "createGame" | "singleGame" | "dailyDoodle";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [gameState, setGameState] = useState<gameStateType>("dailyDoodle");

  const menuItems = [
    { state: "dailyDoodle", label: "Daily Doodle" },
    { state: "singleGame", label: "Single Game" },
    { state: "createGame", label: "Start Game" },
  ];

  return (
    <>
      <div className="mx-auto  p-6 flex flex-col max-w-2xl">
        <div className="flex justify-center">
          <ul className="menu menu-horizontal justify-center p-2 bg-base-300 rounded-full mb-5 w-fit mx-auto">
            {menuItems.map(item => (
              <li key={item.state} onClick={() => setGameState(item.state as gameStateType)}>
                <div
                  className={`px-3 rounded-full py-1 cursor-pointer ${
                    gameState === item.state ? "bg-accent" : "hover:bg-base-100"
                  } transition ease-in-out delay-150`}
                >
                  {item.label}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full mx-auto flex">
          {gameState === "createGame" && <GameCreationForm connectedAddress={connectedAddress as string} />}
          {gameState === "singleGame" && <SingleGame />}
          {gameState === "dailyDoodle" && <DailyDoodle />}
        </div>
      </div>
    </>
  );
};

export default Home;
