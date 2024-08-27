import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { WORDS } from "~~/utils/constants";
import { saveGameState } from "~~/utils/doodleExchange/game";
import { notification } from "~~/utils/scaffold-eth";

const GameCreationForm = ({ connectedAddress }: { connectedAddress: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
        totalRounds: selectedWords.length,
        words: selectedWords,
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

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <h1>Select drawing for each Round(1-10)</h1>
        <div className="my-2 flex flex-wrap gap-1">
          {WORDS.map((word, index) => (
            <button
              type="button"
              key={index}
              disabled={!selectedWords.includes(word) && selectedWords.length == 10}
              className={`btn btn-xs mt-1 ${selectedWords.includes(word) ? "btn-primary" : "btn-secondary"}`}
              onClick={() => toggleWordSelection(word)}
            >
              {word}
              {selectedWords.includes(word) && <XMarkIcon className="h-4 w-4" />}
            </button>
          ))}
        </div>

        <br />
        <button
          type="submit"
          className="btn btn-sm  btn-primary -mt-2"
          disabled={loading || !connectedAddress || selectedWords.length == 0}
        >
          {loading && <span className="loading loading-spinner"></span>}
          Start Game
        </button>
      </form>
    </div>
  );
};

export default GameCreationForm;
