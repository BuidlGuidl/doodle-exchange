import React, { useEffect, useRef } from "react";
import Image from "next/image";

type ImageWithScore = {
  drawingLink: string;
  score: number;
};

interface ImageModalProps {
  imagesWithScores: ImageWithScore[];
  closeModal: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imagesWithScores, closeModal }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeModal]);

  return (
    <>
      {imagesWithScores.length > 0 && (
        <div className="modal modal-open">
          <div ref={modalRef} className="modal-box relative">
            <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={closeModal}>
              ✕
            </button>
            {imagesWithScores.map((item, index) => (
              <React.Fragment key={index}>
                <Image
                  src={item.drawingLink}
                  alt={`Image ${index + 1}`}
                  className="w-full"
                  layout="responsive"
                  width={500}
                  height={300}
                />
                <div className="text-center mb-4">Score: {item.score}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageModal;
