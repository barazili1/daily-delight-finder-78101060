import { createFileRoute } from "@tanstack/react-router";
import { useRequireSession } from "@/lib/guard";
import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Logo } from "@/components/Logo";
import { GameHeaderStats } from "@/components/GameHeaderStats";
import { WinFeed } from "@/components/WinFeed";

export const Route = createFileRoute("/game/wildwest")({
  head: () => ({
    meta: [
      { title: "Wild West Gold — CRAZY VIP" },
      { name: "description", content: "إشارات لعبة Wild West: اختر X2 أو X3 واعرف مكان الكنز." },
      { property: "og:title", content: "Wild West Gold — CRAZY VIP" },
      { property: "og:description", content: "حدد الوضع واحصل على مكان الكنز الصحيح." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WildWestGame,
});

const TREASURE = "https://cdn.phototourl.com/free/2026-08-18-6f899145-8261-4176-b043-7e48e5d494eb.jpg";

function WildWestGame() {
  useRequireSession();
  const [mode, setMode] = useState<2 | 3>(2);
  const [hit, setHit] = useState<number | null>(null);

  const pick = (m: 2 | 3) => {
    setMode(m);
    setHit(null);
  };

  const start = () => setHit(Math.floor(Math.random() * mode));

  return (
    <main dir="ltr" className="relative z-10 min-h-screen bg-transparent pb-16">
      <TopBar />
      <GameHeaderStats />

      <div className="mx-auto max-w-md px-4 pt-4">
        <Logo size={84} />

        <div className="mt-5 flex items-center justify-center gap-3">
          {([2, 3] as const).map((m) => (
            <button
              key={m}
              onClick={() => pick(m)}
              style={{ width: 80, height: 30 }}
              className={`rounded-md border text-xs font-black transition ${
                mode === m
                  ? "border-primary bg-primary text-black shadow-[0_0_18px_rgba(144,214,0,0.5)]"
                  : "border-primary/50 bg-transparent text-foreground"
              }`}
            >
              X{m}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-row items-center justify-center gap-3">
          {Array.from({ length: mode }).map((_, i) => (
            <div
              key={i}
              style={{ width: mode === 2 ? 150 : 105, height: 60, animationDelay: `${i * 140}ms` }}
              className="animate-fade-in relative flex items-center justify-center overflow-hidden rounded-xl border border-primary/40 bg-transparent backdrop-blur-sm transition"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                box {i + 1}
              </span>
              {hit === i && (
                <img
                  src={TREASURE}
                  alt="treasure"
                  loading="lazy"
                  width={150}
                  height={50}
                  className="absolute inset-0 h-full w-full animate-scale-in object-cover"
                />
              )}
            </div>
          ))}
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
            onClick={() => setHit(null)}
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
