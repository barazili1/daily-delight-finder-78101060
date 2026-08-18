import { createFileRoute } from "@tanstack/react-router";
import { useRequireSession } from "@/lib/guard";
import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { GameHeaderStats } from "@/components/GameHeaderStats";
import { WinFeed } from "@/components/WinFeed";
import thimble from "@/assets/thimble-new.png";
import platformLogo from "@/assets/logo.png";
import ball from "@/assets/steel-ball.png";

export const Route = createFileRoute("/game/thimbles")({
  head: () => ({
    meta: [
      { title: "Thimbles — CRAZY VIP" },
      { name: "description", content: "إشارات لعبة Thimbles: اعرف الكوب الذي يخفي الكرة." },
      { property: "og:title", content: "Thimbles — CRAZY VIP" },
      { property: "og:description", content: "خلط الأكواب ثم كشف الكوب الرابح." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ThimblesGame,
});

function ThimblesGame() {
  useRequireSession();
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);

  const start = () => {
    setWinner(null);
    setSpinning(true);
    const pick = Math.floor(Math.random() * 3);
    setTimeout(() => {
      setSpinning(false);
      setWinner(pick);
    }, 900);
  };


  const reset = () => {
    setSpinning(false);
    setWinner(null);
  };

  return (
    <main dir="ltr" className="relative z-10 min-h-screen bg-transparent pb-16">
      <TopBar />
      <GameHeaderStats />

      <div className="mx-auto max-w-md px-4 pt-4">
        <img src={platformLogo} alt="CRAZY VIP logo" width={140} height={140} className="mx-auto h-[110px] w-auto object-contain" />

        <div className="mt-8 flex items-end justify-center gap-4" style={{ height: 240 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative flex flex-col items-center justify-end" style={{ width: 92, height: 215 }}>
              {/* the ball always sits under its cup — revealed only when the cup lifts */}
              {winner === i && (
                <img
                  src={ball}
                  alt="ball"
                  loading="lazy"
                  width={40}
                  height={40}
                  className="absolute bottom-[35px] left-1/2 z-0 h-[40px] w-[40px] -translate-x-1/2"
                />
              )}
              <div
                className="relative z-10"
                style={{
                  width: 92,
                  height: 210,
                  transition: "transform 320ms cubic-bezier(0.22,1,0.36,1)",
                  transform: winner === i ? "translateY(-58px)" : "translateY(0)",
                  animation: spinning ? `thimble-shuffle-${i} 0.3s cubic-bezier(0.65,0,0.35,1) 3` : undefined,
                }}
              >
                <img
                  src={thimble}
                  alt="thimble"
                  loading="lazy"
                  width={92}
                  height={210}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes thimble-shuffle-0 { 0%{transform:translateX(0) translateY(0)} 50%{transform:translateX(104px) translateY(-26px) rotate(6deg)} 100%{transform:translateX(0) translateY(0)} }
          @keyframes thimble-shuffle-1 { 0%{transform:translateX(0) translateY(0)} 50%{transform:translateX(-104px) translateY(26px) rotate(-6deg)} 100%{transform:translateX(0) translateY(0)} }
          @keyframes thimble-shuffle-2 { 0%{transform:translateX(0) translateY(0)} 50%{transform:translateX(-104px) translateY(-26px) rotate(6deg)} 100%{transform:translateX(0) translateY(0)} }
        `}</style>

        <div className="mt-8 flex gap-3">
          <button
            onClick={start}
            disabled={spinning}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-black transition active:scale-95 disabled:opacity-60"
            style={{ backgroundColor: "#90D600", boxShadow: "0 0 26px rgba(144,214,0,0.45)" }}
          >
            <Play className="h-4 w-4" /> بدأ
          </button>
          <button
            onClick={reset}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/95 py-3 text-sm font-black text-black transition active:scale-95"
          >
            <RotateCcw className="h-4 w-4" /> اعاده بدأ
          </button>
        </div>

        <WinFeed />

        <p className="mt-10 text-center text-xs text-muted-foreground">
          كل الحقوق محفوظة لدى منصة crazy vip
        </p>
      </div>
    </main>
  );
}
