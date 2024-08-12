"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { InputBase } from "~~/components/scaffold-eth";
import { joinGame } from "~~/utils/doodleExchange/api/apiUtils";
import { saveGameState } from "~~/utils/doodleExchange/game";
import { notification } from "~~/utils/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [inviteCode, setInviteCode] = useState("");
  const [isGameCreating, setIsGameCreating] = useState<boolean>(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const invite = searchParams.get("invite");

  const createGame = async () => {
    setIsGameCreating(true);
    const response = await fetch("/api/host/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hostAddress: connectedAddress as string }),
    });

    const responseData = await response.json();

    if (responseData.error) {
      notification.error(responseData.error);
      return;
    }

    saveGameState(JSON.stringify(responseData));
    router.push(`/game/${responseData.game.inviteCode}`);
    notification.success(`New Game Started`);
    setIsGameCreating(false);
  };

  const handleJoin = async (invite: string, address: string) => {
    if ((await joinGame(invite, address)).success) {
      router.push(`/game/${invite}`);
      setInviteCode("");
      notification.success(`Joined Game Successfully`);
    }
  };

  useEffect(() => {
    if (invite && connectedAddress) {
      setInviteCode(invite);
      handleJoin(invite, connectedAddress);
      router.replace(pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invite, connectedAddress]);

  return (
    <>
      <Suspense>
        <div className="flex items-center flex-col flex-grow pt-10">
          <button className="btn btn-primary mb-2" onClick={() => createGame()} disabled={isGameCreating}>
            {isGameCreating ? "Creating..." : "Create a new game"}
          </button>
          <InputBase
            name="inviteCode"
            value={inviteCode}
            placeholder="Invite Code"
            onChange={value => {
              setInviteCode(value);
            }}
          />

          <button
            className="btn  btn-primary mt-2"
            type="button"
            onClick={() => handleJoin(inviteCode, connectedAddress as string)}
          >
            Join Game
          </button>
        </div>
      </Suspense>
    </>
  );
};

export default Home;
