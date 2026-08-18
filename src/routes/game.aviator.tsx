import { createFileRoute } from "@tanstack/react-router";
import { useRequireSession } from "@/lib/guard";
import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Logo } from "@/components/Logo";
import { GameHeaderStats } from "@/components/GameHeaderStats";
import { WinFeed } from "@/components/WinFeed";

export const Route = createFileRoute("/game/aviator")({
  head: () => ({
    meta: [
      { title: "Aviator — CRAZY VIP" },
      { name: "description", content: "إشارات لعبة Aviator مع نسبة المضاعفة المتوقعة لكل جولة." },
      { property: "og:title", content: "Aviator — CRAZY VIP" },
      { property: "og:description", content: "اعرف نقطة الخروج المتوقعة قبل الجولة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AviatorGame,
});

const W = 320;
const H = 180;
const DUR = 1500;

function pointAt(t: number) {
  // curved path from bottom-left to top-right
  const x = 10 + (W - 20) * t;
  const y = H - 12 - (H - 40) * Math.pow(t, 2.2);
  return { x, y };
}

function AviatorGame() {
  useRequireSession();
  const [odd, setOdd] = useState(1);
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  const start = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const target = 1.2 + Math.random() * 12;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / DUR);
      setProgress(t);
      setOdd(1 + (target - 1) * t);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const reset = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    setProgress(0);
    setOdd(1);
  };

  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * progress;
    const p = pointAt(t);
    pts.push(`${p.x},${p.y}`);
  }
  const head = pointAt(progress);

  return (
    <main dir="ltr" className="relative z-10 min-h-screen bg-transparent pb-16">
      <TopBar />
      <GameHeaderStats />

      <div className="mx-auto max-w-md px-4 pt-4">
        <Logo size={84} />

        <div className="relative mt-5 overflow-hidden rounded-2xl border border-primary/40 bg-black/30 backdrop-blur-sm">
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="aviator curve">
            <defs>
              <linearGradient id="av-line" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#90D600" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#90D600" />
              </linearGradient>
            </defs>
            {progress > 0 && (
              <>
                <polyline
                  points={pts.join(" ")}
                  fill="none"
                  stroke="url(#av-line)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx={head.x} cy={head.y} r="10" fill="#90D600" opacity="0.25" />
                <circle cx={head.x} cy={head.y} r="6" fill="#90D600" />
              </>
            )}
          </svg>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-black tracking-tight drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              <span className="text-primary">x</span>
              <span className="text-foreground">{odd.toFixed(2)}</span>
            </span>
          </div>
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
