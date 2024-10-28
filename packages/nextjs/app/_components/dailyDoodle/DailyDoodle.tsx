import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Leaderboard from "./Leaderboard";
import CanvasDraw from "react-canvas-draw";
import { CirclePicker } from "react-color";
import { useWindowSize } from "usehooks-ts";
import { useAccount } from "wagmi";
import { ArrowUturnLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getGpt4oEvaluate } from "~~/app/classify";
import { CanvasDrawLines } from "~~/types/game/game";
import {
  hasSubmittedToday,
  submitResult,
  uploadDailyDoodleToFirebase,
} from "~~/utils/doodleExchange/dailyDoodle/utils";
import { getDailyWord } from "~~/utils/doodleExchange/getWordsList";

type gameStateType = "start" | "drawing" | "result" | "leaderboard" | "loading";

const DailyDoodle = () => {
  const { address: connectedAddress } = useAccount();
  const drawingCanvas = useRef<CanvasDrawLines>(null);
  const [color, setColor] = useState<string>("rgba(96,125,139,100)");
  const [canvasDisabled, setCanvasDisabled] = useState<boolean>(false);
  const [finalDrawing, setFinalDrawing] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [drawWord, setDrawWord] = useState<string>("");
  const [gptAnswer, setGPTAnswer] = useState<string>("");
  // const [startGame, setStartGame] = useState<boolean>(false);
  const [gameState, setGameState] = useState<gameStateType>("loading");

  const { width = 1, height = 1 } = useWindowSize({ initializeWithValue: false, debounceDelay: 500 });
  const calculatedCanvaSize = Math.round(0.7 * Math.min(width, height));
  const colorPickerSize = Math.round(0.95 * calculatedCanvaSize).toString() + "px";

  const fetchWord = async () => {
    const response = await getDailyWord();
    setDrawWord(response);
  };

  useEffect(() => {
    fetchWord();
  }, []);

  useEffect(() => {
    const defineState = async () => {
      if (connectedAddress) {
        const isAddressSubmittedToday = await hasSubmittedToday(connectedAddress);
        if (isAddressSubmittedToday) {
          setGameState("leaderboard");
        } else {
          setGameState("start");
        }
      }
    };

    defineState();
  }, [connectedAddress]);

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
    setGameState("result");
    const drawingDataUrl = drawingCanvas.current?.canvas.drawing.toDataURL() || "";
    setFinalDrawing(drawingDataUrl);
    const response = await getGpt4oEvaluate(drawingCanvas?.current?.canvas.drawing.toDataURL(), drawWord);
    if (response?.answer) {
      const uploadedDrawingLink = await uploadDailyDoodleToFirebase(
        drawWord,
        connectedAddress || "",
        response?.answer,
        drawingDataUrl,
      );
      await submitResult(connectedAddress || "", uploadedDrawingLink, response?.answer, drawWord);
      setGPTAnswer(response?.answer);
    } else {
      console.log("error with evalution part");
    }
    setCanvasDisabled(false);
  };

  if (loading) {
    return <span className="flex flex-col m-auto loading loading-spinner loading-sm mt-5"></span>;
  }

  return (
    <div className="flex items-center flex-col flex-grow -mt-2">
      {gameState === "start" && (
        <>
          <h1 className="text-2xl mt-10">
            Today&apos;s challenge is <b>{drawWord}</b>
          </h1>
          <p className="text-center">
            Do your best to draw it, and let GPT evaluate your drawing on a scale from 0 to 1000!
          </p>
          <button className="btn btn-sm btn-primary" onClick={() => setGameState("drawing")}>
            Start Game
          </button>
        </>
      )}
      {gameState === "drawing" && (
        <>
          <div className="flex flex-col gap-2 mb-2">
            <div className="m-auto">
              <span className="text-3xl">{drawWord}</span>
            </div>
            <div>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  drawingCanvas.current?.undo();
                }}
              >
                <ArrowUturnLeftIcon className="h-4 w-4" /> UNDO
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  drawingCanvas?.current?.clear();
                }}
              >
                <TrashIcon className="h-4 w-4" /> Clear
              </button>
            </div>
          </div>
          <div className={`${canvasDisabled ? "cursor-not-allowed" : "cursor-none"}`}>
            <CanvasDraw
              key={"canvas"}
              ref={drawingCanvas}
              canvasWidth={calculatedCanvaSize}
              canvasHeight={calculatedCanvaSize}
              brushColor={color}
              lazyRadius={0}
              brushRadius={3}
              disabled={canvasDisabled}
              hideGrid={true}
              immediateLoading={true}
              loadTimeOffset={10}
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
            <div className="flex justify-center mt-2">
              <button className="btn btn-block btn-primary" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        </>
      )}
      {gameState === "result" && (
        <>
          <div className="mb-1.5 text-center">
            {gptAnswer ? (
              <div className="flex flex-col items-center">
                <button className="btn btn-sm btn-primary mb-1" onClick={() => setGameState("leaderboard")}>
                  {"Check the leaderboard"}
                </button>
                <div>
                  You score: <span className="font-bold">{gptAnswer}</span>
                </div>
              </div>
            ) : (
              <span className="flex flex-col m-auto loading loading-spinner loading-sm"></span>
            )}
          </div>
          <div className="border-2 bg-white">
            <Image
              width={calculatedCanvaSize}
              height={calculatedCanvaSize}
              src={`${finalDrawing}`}
              alt="Your drawing"
            />
          </div>
        </>
      )}
      {gameState === "leaderboard" && (
        <>
          <button className="btn btn-sm btn-primary" onClick={() => setGameState("drawing")}>
            Try again
          </button>
          <Leaderboard />
        </>
      )}
    </div>
  );
};

export default DailyDoodle;
