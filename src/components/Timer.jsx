import { useEffect, useRef, useState } from "react";
import { AlarmClock } from "lucide-react";

export function useCountdown(initialSeconds, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpireRef.current?.();
      return;
    }
    const id = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft > 0]);

  return { secondsLeft, setSecondsLeft };
}

export function formatTime(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function TimerBadge({ secondsLeft, warnUnder = 300 }) {
  const isWarning = secondsLeft <= warnUnder;
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono-ui text-sm font-semibold ${
        isWarning ? "bg-rose-500/15 text-rose-500 animate-pulse" : "bg-signal-500/10 text-signal-600 dark:text-signal-400"
      }`}
    >
      <AlarmClock size={15} />
      {formatTime(secondsLeft)}
    </div>
  );
}
