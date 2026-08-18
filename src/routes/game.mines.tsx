import { createFileRoute } from "@tanstack/react-router";
import { useRequireSession } from "@/lib/guard";
import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Logo } from "@/components/Logo";
import { GameHeaderStats } from "@/components/GameHeaderStats";
import { WinFeed } from "@/components/WinFeed";

export const Route = createFileRoute("/game/mines")({
  head: () => ({
    meta: [
      { title: "Gems Mines — CRAZY VIP" },
      { name: "description", content: "إشارات لعبة Gems Mines: حدد عدد الألماس واحصل على أماكنها." },
      { property: "og:title", content: "Gems Mines — CRAZY VIP" },
      { property: "og:description", content: "حدد عدد الألماس من 1 إلى 24 واحصل على الإشارة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MinesGame,
});

const BG = "https://cdn.phototourl.com/free/2026-08-18-81e5f395-917f-46dd-9bac-8e001995a337.png";
const CELL = "https://cdn.phototourl.com/free/2026-08-18-1a7d4e7f-96a1-46e9-a0a2-0f9ef5f65b8c.jpg";
const GEM = "https://cdn.phototourl.com/free/2026-08-18-2abb19e9-0aa2-4bb2-ab50-5a697a015467.png";

function MinesGame() {
  useRequireSession();
  const [count, setCount] = useState(3);
  const [gems, setGems] = useState<number[] | null>(null);

  const start = () => {
    const idx = Array.from({ length: 25 }, (_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j]!, idx[i]!];
    }
    setGems(idx.slice(0, count));
  };

  return (
    <main dir="ltr" className="relative z-10 min-h-screen bg-transparent pb-16">
      <TopBar />
      <GameHeaderStats />

      <div className="mx-auto max-w-md px-4 pt-4">
        <Logo size={84} />

        <div
          className="mt-5 rounded-2xl border border-primary/40 bg-cover bg-center p-3 shadow-[0_0_35px_rgba(144,214,0,0.18)]"
          style={{ backgroundImage: `url(${BG})` }}
        >
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 25 }).map((_, i) => {
              const hit = gems?.includes(i);
              return (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-lg border border-primary/25"
                >
                  <img src={CELL} alt="cell" loading="lazy" width={120} height={120} className="h-full w-full object-cover" />
                  {hit && (
                    <img
                      src={GEM}
                      alt="gem"
                      loading="lazy"
                      width={120}
                      height={120}
                      className="absolute inset-0 h-full w-full animate-pop-in object-contain p-1 drop-shadow-[0_0_10px_rgba(144,214,0,0.8)]"
                      style={{ animationDelay: `${(gems?.indexOf(i) ?? 0) * 110}ms` }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-primary/30 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>عدد الألماس</span>
            <span className="text-lg font-black text-primary">{count}</span>
          </div>
          <input
            type="range"
            min={1}
            max={24}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-[#90D600]"
          />
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={start}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-black transition active:scale-95"
            style={{ backgroundColor: "#90D600", boxShadow: "0 0 26px rgba(144,214,0,0.45)" }}
          >
            <Play className="h-4 w-4" /> بدأ
          </button>
          <button
            onClick={() => setGems(null)}
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
