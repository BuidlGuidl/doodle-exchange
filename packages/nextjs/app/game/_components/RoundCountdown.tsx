// components/CountdownOverlay.jsx
import { useEffect, useState } from "react";

const RoundCountdown = ({ onCountdownEnd }: { onCountdownEnd: () => void }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer: any;
    if (countdown >= 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else {
      onCountdownEnd();
    }

    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="text-white text-7xl font-semibold animate-ping-1000">{countdown <= 0 ? "GO!" : countdown}</div>
    </div>
  );
};

export default RoundCountdown;
