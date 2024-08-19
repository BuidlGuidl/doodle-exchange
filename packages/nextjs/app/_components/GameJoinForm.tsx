import React, { Dispatch, SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";
import { InputBase } from "~~/components/scaffold-eth";
import { joinGame } from "~~/utils/doodleExchange/api/apiUtils";

const GameJoinForm = ({
  inviteCode,
  setInviteCode,
  connectedAddress,
}: {
  inviteCode: string;
  setInviteCode: Dispatch<SetStateAction<string>>;
  connectedAddress: string;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = (value: string) => {
    setInviteCode(value);
  };

  const handleJoin = async (invite: string, address: string) => {
    setLoading(true);
    if ((await joinGame(invite, address)).success) {
      router.push(`/game/${invite}`);
      setInviteCode("");
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      <div>
        <label>
          <h1 className="mb-4"> Enter Invite Code</h1>
          <InputBase name="inviteCode" value={inviteCode} placeholder="Invite Code" onChange={handleChange} />
        </label>
        <button
          className="btn btn-sm btn-primary mt-4 "
          type="button"
          onClick={() => handleJoin(inviteCode, connectedAddress)}
          disabled={loading}
        >
          {loading && <span className="loading loading-spinner"></span>}
          Join Game
        </button>
      </div>
    </div>
  );
};

export default GameJoinForm;
