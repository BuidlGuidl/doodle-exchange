import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { QrCodeIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { notification } from "~~/utils/scaffold-eth";

// @ts-ignore
const ReactQrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

const QrCodeReader = () => {
  const [isQrReaderOpen, setIsQrReaderOpen] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUrl = window.location.href;
      setPageUrl(currentUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScan = async (result: string) => {
    if (result.startsWith(pageUrl)) {
      router.push(result);
    } else {
      setIsQrReaderOpen(false);
      notification.error("Invalid game url");
      return;
    }
  };

  return (
    <>
      {!isQrReaderOpen && (
        <button className="btn  btn-circle" onClick={() => setIsQrReaderOpen(true)}>
          <QrCodeIcon className="w-5 h-5" />
        </button>
      )}
      {isQrReaderOpen && (
        <>
          <div className="max-w-[90%] w-[300px] h-[300px] fixed top-0 left-0 right-0 bottom-0 m-auto z-[100]">
            <button className="block ml-auto mb-1 pointer-events-auto" onClick={() => setIsQrReaderOpen(false)}>
              <XCircleIcon className="w-6 h-6 text-white" />
            </button>
            <ReactQrReader
              // @ts-ignore
              onScan={(result: any) => {
                if (!!result) {
                  handleScan(result);
                } else {
                  return;
                }
              }}
              onError={(error: any) => console.log(error)}
              style={{ width: "100%", zIndex: 100 }}
            />
          </div>
          <div className="fixed inset-0 z-[99] bg-black bg-opacity-80" onClick={() => setIsQrReaderOpen(false)} />
        </>
      )}
    </>
  );
};

export { QrCodeReader };
