import { useEffect, useState } from "react";
import { Clock, User } from "lucide-react";
import { readSession, readUserId } from "@/lib/session";

export function GameHeaderStats() {
  const [left, setLeft] = useState<string>("--:--");
  const [uid, setUid] = useState<string>("—");

  useEffect(() => {
    const s = readSession();
    setUid(s?.userId || readUserId() || "—");
    const tick = () => {
      const sess = readSession();
      if (!sess) {
        setLeft("00:00");
        return;
      }
      const ms = Math.max(0, new Date(sess.expiresAt).getTime() - Date.now());
      const m = Math.floor(ms / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      setLeft(`${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const box = "flex-1 rounded-xl border border-primary/35 bg-transparent px-3 py-2 text-center backdrop-blur-sm";

  return (
    <div className="mx-auto mt-4 flex max-w-md gap-3 px-4">
      <div className={box}>
        <span className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Clock className="h-3 w-3 text-primary" /> time left
        </span>
        <span className="mt-0.5 block font-mono text-base font-black text-primary">{left}</span>
      </div>
      <div className={box}>
        <span className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          <User className="h-3 w-3 text-primary" /> user id
        </span>
        <span className="mt-0.5 block truncate font-mono text-base font-black text-foreground">{uid}</span>
      </div>
    </div>
  );
}
