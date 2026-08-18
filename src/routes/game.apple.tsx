import { createFileRoute } from "@tanstack/react-router";
import { useRequireSession } from "@/lib/guard";
import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Logo } from "@/components/Logo";
import { GameHeaderStats } from "@/components/GameHeaderStats";
import { WinFeed } from "@/components/WinFeed";

export const Route = createFileRoute("/game/apple")({
  head: () => ({
    meta: [
      { title: "Apple of Fortune — CRAZY VIP" },
      { name: "description", content: "إشارات لعبة Apple of Fortune مع نسب المضاعفة لحظة بلحظة." },
      { property: "og:title", content: "Apple of Fortune — CRAZY VIP" },
      { property: "og:description", content: "احصل على إشارات التفاحة السليمة في كل صف." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppleGame,
});

const CLOSED = "https://logo12.gamer.gd/cvb.png";
const GOOD = "https://logo12.gamer.gd/apple.png";
const BAD = "https://logo12.gamer.gd/poi.png";

// bottom row -> top row
const ODDS = ["1.23", "1.54", "1.93", "2.41", "4.02", "6.71", "11.18", "27.97", "69.93", "349.43"];

function AppleGame() {
  useRequireSession();
  const [rows, setRows] = useState<number[] | null>(null);

  const start = () => setRows(Array.from({ length: 10 }, () => Math.floor(Math.random() * 5)));
  const reset = () => setRows(null);

  return (
    <main dir="ltr" className="relative z-10 min-h-screen bg-transparent pb-16">
      <TopBar />
      <GameHeaderStats />

      <div className="mx-auto max-w-md px-4 pt-4">
        <Logo size={84} />

        <div className="mt-5 flex flex-col gap-2">
          {ODDS.slice().reverse().map((odd, rowIdxFromTop) => {
            const rowIndex = 9 - rowIdxFromTop;
            const bad = rows?.[rowIndex];
            return (
              <div key={odd} className="flex items-center justify-center gap-2">
                <span className="mr-1 w-14 rounded-md border border-primary/35 py-1 text-center text-[11px] font-black text-primary">
                  {odd}
                </span>
                {Array.from({ length: 5 }).map((_, c) => {
                  const src = rows == null ? CLOSED : c === bad ? BAD : GOOD;
                  return (
                    <span
                      key={c}
                      style={{ width: 45, height: 45, animationDelay: `${rowIdxFromTop * 90 + c * 45}ms` }}
                      className="animate-scale-in overflow-hidden rounded-lg border border-primary/30 bg-black/30"
                    >
                      <img src={src} alt="cell" loading="lazy" width={45} height={45} className="h-full w-full object-cover" />
                    </span>
                  );
                })}
              </div>

            );
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={start}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-black transition active:scale-95"
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
