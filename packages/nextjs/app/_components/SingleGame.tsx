import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import CanvasDraw from "react-canvas-draw";
import { CirclePicker } from "react-color";
import { useWindowSize } from "usehooks-ts";
import { useAccount } from "wagmi";
import { ArrowUturnLeftIcon, ForwardIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getGpt4oClassify } from "~~/app/classify";
import { CanvasDrawLines } from "~~/types/game/game";
import { getWord } from "~~/utils/doodleExchange/getWordsList";
import { isGuessCorrect, makeConfetti } from "~~/utils/doodleExchange/helpersClient";
import { uploadToFirebase } from "~~/utils/uploadToFirebase";

const SingleGame = () => {
  const { address: connectedAddress } = useAccount();
  const drawingCanvas = useRef<CanvasDrawLines>(null);
  const [color, setColor] = useState<string>("rgba(96,125,139,100)");
  const [canvasDisabled, setCanvasDisabled] = useState<boolean>(false);
  const [finalDrawing, setFinalDrawing] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [drawWord, setDrawWord] = useState<string>("");
  const [gptAnswer, setGPTAnswer] = useState<string>("");

  const { width = 1, height = 1 } = useWindowSize({ initializeWithValue: false, debounceDelay: 500 });
  const calculatedCanvaSize = Math.round(0.7 * Math.min(width, height));
  const colorPickerSize = Math.round(0.95 * calculatedCanvaSize).toString() + "px";

  const fetchWord = async () => {
    const response = await getWord();
    setDrawWord(response);
  };

  useEffect(() => {
    if (!drawWord) {
      fetchWord();
    }
  }, []);

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
    setFinalDrawing(drawingDataUrl);
    console.log(drawingDataUrl);
    const response = await getGpt4oClassify(drawingCanvas?.current?.canvas.drawing.toDataURL());
    if (response?.answer) {
      if (isGuessCorrect(response.answer, drawWord)) {
        makeConfetti();
      }
      setGPTAnswer(response?.answer);
      uploadToFirebase(drawWord, response?.answer, connectedAddress || "", drawingDataUrl);
    } else {
      console.log("error with classification fetching part");
    }
  };

  const resetGame = () => {
    if (isGuessCorrect(gptAnswer, drawWord)) {
      fetchWord();
    }
    setCanvasDisabled(false);
    setGPTAnswer("");
    setFinalDrawing("");
  };

  if (loading) {
    return <span className="flex flex-col m-auto loading loading-spinner loading-sm"></span>;
  }

  return (
    <div className="flex items-center flex-col flex-grow -mt-2">
      {finalDrawing ? (
        <>
          <div className="mb-1.5 text-center">
            {gptAnswer ? (
              <div className="flex flex-col items-center">
                <button className="btn btn-sm btn-primary mb-1" onClick={resetGame}>
                  {isGuessCorrect(gptAnswer, drawWord) ? "Start a new game" : "Try again"}
                </button>
                <div>
                  GPT sees <span className="font-bold">{gptAnswer}</span>
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
      ) : (
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
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  fetchWord();
                }}
              >
                <ForwardIcon className="h-4 w-4" /> Skip
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
    </div>
  );
};

export default SingleGame;
