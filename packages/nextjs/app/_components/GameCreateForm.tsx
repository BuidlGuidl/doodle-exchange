import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { gameDifficultyButtons } from "~~/types/utils";
import { WORDS } from "~~/utils/constants";
import { saveGameState } from "~~/utils/doodleExchange/game";
import { notification } from "~~/utils/scaffold-eth";

const GameCreationForm = ({ connectedAddress }: { connectedAddress: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sliderValue, setSliderValue] = useState(6);
  const [selectedDifficulty, setSelectedDifficulty] = useState<gameDifficultyButtons>("easy");

  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const toggleWordSelection = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/host/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hostAddress: connectedAddress as string,
        totalRounds: selectedDifficulty === "custom" ? selectedWords.length : sliderValue,
        words: selectedDifficulty === "custom" ? selectedWords : [],
        difficulty: selectedDifficulty,
      }),
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
        <h1 className="mt-0">Select level of difficulty</h1>
        <div className="flex gap-3 mb-3">
          {["easy", "medium", "hard", "custom"].map(level => (
            <button
              key={level}
              type="button"
              className={`btn btn-sm mt-1 ${selectedDifficulty === level ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setSelectedDifficulty(level as gameDifficultyButtons)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        {selectedDifficulty === "custom" ? (
          <>
            <h1>Select drawing for each Round (1-10)</h1>
            <div className="flex flex-wrap gap-1 max-w-72">
              {WORDS.map((word, index) => (
                <button
                  type="button"
                  key={index}
                  disabled={!selectedWords.includes(word) && selectedWords.length === 10}
                  className={`btn btn-xs mt-1 px-1.5 ${selectedWords.includes(word) ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => toggleWordSelection(word)}
                >
                  {word}
                  {selectedWords.includes(word) && <XMarkIcon className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </>
        ) : (
          <label className="block">
            <h1 className="mt-3">Choose the Number of Rounds (1-10)</h1>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={sliderValue}
                onChange={handleSliderChange}
                className="slider appearance-none w-[87%] h-2 bg-primary rounded outline-none slider-thumb"
              />
              <span className="slider-value p-2 bg-primary w-[13%] font-bold rounded-md flex justify-center">
                {sliderValue}
              </span>
            </div>
          </label>
        )}

        <br />
        {connectedAddress ? (
          <button
            type="submit"
            className="btn btn-sm btn-primary -mt-2"
            disabled={loading || !connectedAddress || (selectedDifficulty === "custom" && selectedWords.length === 0)}
          >
            {loading && <span className="loading loading-spinner"></span>}
            Start Game
          </button>
        ) : (
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-300 h-8 w-24 mt-4"></div>
          </div>
        )}
      </form>
    </div>
  );
};

export default GameCreationForm;
