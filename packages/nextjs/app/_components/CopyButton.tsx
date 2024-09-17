import React, { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

type CopyButtonProps = {
  textToCopy: string;
};

const CopyButton = ({ textToCopy }: CopyButtonProps) => {
  const [isTextCopied, setIsTextCopied] = useState<boolean>(false);
  return (
    <>
      {isTextCopied ? (
        <CheckCircleIcon
          className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
          aria-hidden="true"
        />
      ) : (
        <CopyToClipboard
          text={textToCopy?.toString() || ""}
          onCopy={() => {
            setIsTextCopied(true);
            setTimeout(() => {
              setIsTextCopied(false);
            }, 800);
          }}
        >
          <DocumentDuplicateIcon
            className="ml-1.5 text-xl font-normal text-sky-600 h-5 w-5 cursor-pointer"
            aria-hidden="true"
          />
        </CopyToClipboard>
      )}
    </>
  );
};

export default CopyButton;
