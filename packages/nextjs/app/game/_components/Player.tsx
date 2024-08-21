import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import CanvasDraw from "react-canvas-draw";
import { CirclePicker } from "react-color";
import { useWindowSize } from "usehooks-ts";
import { useAccount } from "wagmi";
import { ArrowUturnLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getGpt4oClassify } from "~~/app/classify";
import { Game, Player as playerType } from "~~/types/game/game";
import { updatePlayerStatus } from "~~/utils/doodleExchange/api/apiUtils";
import { uploadToFirebase } from "~~/utils/uploadToFirebase";

interface CanvasDrawLines extends CanvasDraw {
  canvas: any;
  props: {
    brushColor: string;
    canvasWidth: any;
    canvasHeight: any;
  };
}

const fire = (particleRatio: number, opts: any) => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
  };
  confetti({
    ...defaults,
    ...opts,
    particleCount: Math.floor(count * particleRatio),
  });
};

const makeConfetti = () => {
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

const Player = ({
  game,
  moveToNextRound,
  player,
  isUpdatingRound,
  countdown,
  token,
}: {
  game: Game;
  moveToNextRound: (winner: string, won: boolean) => void;
  player: playerType;
  isUpdatingRound: boolean;
  countdown: number;
  token: string;
}) => {
  const { address: connectedAddress } = useAccount();
  const drawingCanvas = useRef<CanvasDrawLines>(null);
  const [color, setColor] = useState<string>("rgba(96,125,139,100)");
  const [canvasDisabled, setCanvasDisabled] = useState<boolean>(false);
  const [finalDrawing, setFinalDrawing] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showTryAgain, setShowTryAgain] = useState<boolean>(false);
  const [gptAnswer, setGPTAnswer] = useState<string>("");
  const [drawingStarted, setDrawingStarted] = useState(false);

  const { width = 1, height = 1 } = useWindowSize({ initializeWithValue: false, debounceDelay: 500 });
  const calculatedCanvaSize = Math.round(0.8 * Math.min(width, height));
  const colorPickerSize = `${Math.round(0.95 * calculatedCanvaSize)}px`;

  const isLastRound = game.currentRound === game.totalRounds - 1;
  const countdownText = isLastRound
    ? `Ending the game in ${countdown} Seconds`
    : `Moving to next round in ${countdown} Seconds`;

  useEffect(() => {
    if (calculatedCanvaSize !== 1) {
      setLoading(false);
    }
  }, [calculatedCanvaSize]);

  const updateColor = (value: any) => {
    const { r, g, b, a } = value.rgb;
    setColor(`rgba(${r},${g},${b},${a})`);
  };

  const handleSubmit = async () => {
    setCanvasDisabled(true);
    const drawingDataUrl = drawingCanvas.current?.canvas.drawing.toDataURL() || "";
    updatePlayerStatus(game._id, "classifying", token, connectedAddress || "");
    setFinalDrawing(drawingDataUrl);
    console.log(drawingDataUrl);
    const response = await getGpt4oClassify(drawingDataUrl);
    let imageFbLink = "";
    if (response?.answer) {
      imageFbLink = await uploadToFirebase(
        game.wordsList?.[player.currentRound],
        response.answer,
        connectedAddress || "",
        drawingDataUrl,
      );
      setGPTAnswer(response.answer);
      if (response.answer.toLowerCase() === game.wordsList?.[player.currentRound]?.toLowerCase()) {
        makeConfetti();
        moveToNextRound(connectedAddress || "", true);
        setCanvasDisabled(false);
        updatePlayerStatus(game._id, "waiting", token, connectedAddress || "");
      } else {
        updatePlayerStatus(game._id, "waiting", token, connectedAddress || "", imageFbLink);
        setShowTryAgain(true);
      }
    } else {
      console.log("error with classification fetching part");
    }
    setCanvasDisabled(true);
    setDrawingStarted(false);
  };

  const resetGame = async () => {
    setGPTAnswer("");
    setCanvasDisabled(false);
    setFinalDrawing("");
    setShowTryAgain(false);
  };

  useEffect(() => {
    if (!isUpdatingRound) {
      resetGame();
    }
  }, [isUpdatingRound]);

  if (loading) {
    return <span className="flex flex-col m-auto loading loading-spinner loading-sm"></span>;
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-3">
      {finalDrawing ? (
        <>
          <div className="mb-1.5 text-center">
            {gptAnswer ? (
              <div className="flex flex-col items-center">
                {showTryAgain && (
                  <button className="btn btn-sm btn-primary mb-1" onClick={resetGame}>
                    Try again
                  </button>
                )}
                <div>
                  GPT sees <span className="font-bold">{gptAnswer}</span>
                </div>
                <div className={`h-6 ${!isUpdatingRound && "hidden"}`}>{countdownText}</div>
              </div>
            ) : (
              <span className="flex flex-col m-auto loading loading-spinner loading-sm"></span>
            )}
          </div>
          <div className="border-2 bg-white">
            <Image width={calculatedCanvaSize} height={calculatedCanvaSize} src={finalDrawing} alt="Your drawing" />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2 mb-2">
            <div className="m-auto">
              <span className="text-3xl">{game.wordsList?.[game.currentRound]}</span>
            </div>
            <div>
              <button className="btn btn-sm btn-secondary" onClick={() => drawingCanvas.current?.undo()}>
                <ArrowUturnLeftIcon className="h-4 w-4" /> UNDO
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => drawingCanvas.current?.clear()}>
                <TrashIcon className="h-4 w-4" /> Clear
              </button>
            </div>
          </div>
          <div className={`h-6 ${!isUpdatingRound && "hidden"}`}>{countdownText}</div>
          <div className={canvasDisabled ? "cursor-not-allowed" : "cursor-none"}>
            <CanvasDraw
              key="canvas"
              ref={drawingCanvas}
              canvasWidth={calculatedCanvaSize}
              canvasHeight={calculatedCanvaSize}
              brushColor={color}
              lazyRadius={1}
              brushRadius={3}
              disabled={canvasDisabled}
              hideGrid
              immediateLoading
              loadTimeOffset={10}
              onChange={() => {
                if (drawingStarted) {
                  return;
                }
                updatePlayerStatus(game._id, "drawing", token, connectedAddress || "");
                setDrawingStarted(true);
              }}
            />
          </div>
          <div className="flex flex-col mt-2">
            <CirclePicker
              color={color}
              onChangeComplete={updateColor}
              circleSpacing={4}
              width={colorPickerSize}
              className="max-w-xl"
            />
            <div className="flex flex-col justify-center mt-2">
              <button
                className="btn btn-block btn-primary"
                onClick={handleSubmit}
                disabled={game.currentRound !== player.currentRound}
              >
                Submit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Player;
