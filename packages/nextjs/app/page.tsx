"use client";

import { useState } from "react";
import GameCreationForm from "./_components/GameCreateForm";
import GameJoinForm from "./_components/GameJoinForm";
import SingleGame from "./_components/SingleGame";
import type { NextPage } from "next";
import { useAccount } from "wagmi";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [inviteCode, setInviteCode] = useState("");
  const [gameState, setGameState] = useState<"createGame" | "joinGame" | "singleGame">("joinGame");

  return (
    <>
      <div className="mx-auto mt-5 p-6 flex flex-col">
        <div className="flex justify-center">
          <ul className="menu menu-horizontal justify-center p-2 bg-base-300 rounded-full mb-8 w-fit mx-auto">
            <li onClick={() => setGameState("joinGame")}>
              <a
                className={
                  gameState == "joinGame"
                    ? "bg-accent px-3 rounded-full py-1 cursor-pointer "
                    : "px-3 rounded-full py-1 cursor-pointer hover:bg-base-100"
                }
              >
                Join Game
              </a>
            </li>
            <li onClick={() => setGameState("createGame")}>
              <a
                className={
                  gameState == "createGame"
                    ? "bg-accent px-3 rounded-full py-1 cursor-pointer  transition ease-in-out delay-150"
                    : "px-3 rounded-full py-1 cursor-pointer hover:bg-base-100"
                }
              >
                Start Game
              </a>
            </li>
            <li onClick={() => setGameState("singleGame")}>
              <a
                className={
                  gameState == "singleGame"
                    ? "bg-accent px-3 rounded-full py-1 cursor-pointer  transition ease-in-out delay-150"
                    : "px-3 rounded-full py-1 cursor-pointer hover:bg-base-100"
                }
              >
                Single Game
              </a>
            </li>
          </ul>
        </div>

        <div className="w-full mx-auto flex">
          {gameState == "createGame" && <GameCreationForm connectedAddress={connectedAddress as string} />}
          {gameState == "joinGame" && (
            <GameJoinForm
              inviteCode={inviteCode}
              setInviteCode={setInviteCode}
              connectedAddress={connectedAddress as string}
            />
          )}
          {gameState == "singleGame" && <SingleGame />}
        </div>
      </div>
    </>
  );
};

export default Home;
