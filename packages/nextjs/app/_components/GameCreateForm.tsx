import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { saveGameState } from "~~/utils/doodleExchange/game";
import { notification } from "~~/utils/scaffold-eth";

const GameCreationForm = ({ connectedAddress }: { connectedAddress: string }) => {
  const router = useRouter();
  const [sliderValue, setSliderValue] = useState(6);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/host/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hostAddress: connectedAddress as string, totalRounds: sliderValue }),
    });

    const responseData = await response.json();

    if (responseData.error) {
      notification.error(responseData.error);
      return;
    }

    saveGameState(JSON.stringify(responseData));
    router.push(`/game/${responseData.game.inviteCode}`);
    notification.success(`New Game Started`);
    setLoading(false);
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setSliderValue(value);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <label className="block">
          <h1 className=" mb-3 ">Choose the Number of Rounds (1-10)</h1>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="10"
              value={sliderValue}
              onChange={handleSliderChange}
              className="slider appearance-none w-[87%] h-2 bg-primary rounded outline-none slider-thumb "
            />
            <span className="slider-value p-2 bg-primary w-[13%] font-bold rounded-md flex justify-center">
              {sliderValue}
            </span>
          </div>
        </label>
        <br />
        <button type="submit" className="btn btn-sm  btn-primary -mt-2" disabled={loading}>
          {loading && <span className="loading loading-spinner"></span>}
          Start Game
        </button>
      </form>
    </div>
  );
};

export default GameCreationForm;
