import React from "react";
import Image from "next/image";

const ImageModal = ({ showImage, closeModal }: { showImage: string; closeModal: () => void }) => {
  return (
    <>
      {showImage && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={closeModal}>
              ✕
            </button>
            <Image src={showImage} alt="Sample Image" className="w-full" layout="responsive" width={500} height={300} />
          </div>
        </div>
      )}
    </>
  );
};

export default ImageModal;
