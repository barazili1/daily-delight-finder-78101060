import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, Play, Star, TrendingUp } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Logo } from "@/components/Logo";
import { LoadingDialog } from "@/components/LoadingDialog";
import { Brand } from "@/components/Brand";
import { ChoiceDialog, CodeDialog } from "@/components/ActivationDialogs";
import {
  clearAwaitingCode,
  
  readPendingGame,
  savePendingGame,
} from "@/lib/session";
import apple from "@/assets/game-apple.jpg";
import crash from "@/assets/game-crash.jpg";
import mines from "@/assets/game-mines.jpg";
import thimbles from "@/assets/game-thimbles.jpg";
import wildwest from "@/assets/game-wildwest.jpg";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "الألعاب — CRAZY VIP" },
      { name: "description", content: "اختر لعبتك: Apple of fortune، Crash، Gems Mines، Thimbles، Wild West." },
      { property: "og:title", content: "الألعاب — CRAZY VIP" },
      { property: "og:description", content: "اختر لعبتك وابدأ اللعب الآن مع CRAZY VIP." },
    ],
  }),
  component: GamesPage,
});

const GAMES = [
  { name: "Apple of fortune", img: apple, tag: "HOT", rate: "94%", to: "/game/apple" },
  { name: "Crash", img: crash, tag: "TOP", rate: "97%", to: "/game/aviator" },
  { name: "Gems Mines", img: mines, tag: "NEW", rate: "92%", to: "/game/mines" },
  { name: "Thimbles", img: thimbles, tag: "VIP", rate: "90%", to: "/game/thimbles" },
  { name: "Wild West", img: wildwest, tag: "HOT", rate: "95%", to: "/game/wildwest" },

];

function GamesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const [codeOpen, setCodeOpen] = useState(false);

  // Coming back from the Telegram bot: just land on this first page,
  // no code input is opened automatically.
  useEffect(() => {
    clearAwaitingCode();
  }, []);


  const play = (to: string) => {
    savePendingGame(to);
    setChoice(to);
  };

  const onGet = () => {
    setChoice(null);
    setLoading(true);
    setTimeout(() => navigate({ to: "/terms" }), 3000);
  };

  const onUse = () => {
    setCodeOpen(true);
  };

  const onVerified = () => {
    const to = (choice ?? readPendingGame() ?? "") || "/game/apple";
    clearAwaitingCode();
    setCodeOpen(false);
    setChoice(null);
    setLoading(true);
    setTimeout(() => navigate({ to }), 3000);
  };

  return (
    <main dir="ltr" className="relative z-10 min-h-screen bg-transparent pb-16">
      <TopBar />

      <div className="mx-auto max-w-md px-4 pt-8">
        <Logo size={120} />

        <div
          className="mx-auto mt-5 flex items-center justify-center overflow-hidden rounded-2xl border border-primary/40 bg-black/40 shadow-[0_0_35px_rgba(144,214,0,0.18)]"
          style={{ width: 380, maxWidth: "100%", height: 200 }}
        >
          <video
            src="https://www.image2url.com/r2/default/videos/1787062476031-24e4168d-512a-415a-acaa-e2da3d6747c3.mp4"
            autoPlay
            loop
            muted
            ref={(el) => {
              if (!el) return;
              el.muted = true;
              el.play().catch(() => {});
            }}
            playsInline
            controls
            preload="auto"
            className="h-full w-full object-cover"
          />

        </div>


        <h1 className="mt-4 text-center text-2xl">
          <Brand />
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Premium signals · أعلى نسبة فوز اليوم
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: Flame, label: "Hot", value: "5" },
            { icon: TrendingUp, label: "Winrate", value: "94%" },
            { icon: Star, label: "VIP", value: "PRO" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-primary/25 bg-transparent p-3 text-center backdrop-blur-sm"
            >
              <s.icon className="mx-auto h-4 w-4 text-primary" />
              <div className="mt-1 text-sm font-bold text-foreground">{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-10">
          {GAMES.map((g, i) => (
            <div key={g.name} className="flex flex-col items-center gap-4">
              <div className="flex w-[280px] items-center justify-between text-xs">
                <span className="font-mono text-muted-foreground">#{String(i + 1).padStart(2, "0")}</span>
                <span className="rounded-full border border-primary/40 px-2 py-0.5 font-bold text-primary">
                  {g.tag}
                </span>
              </div>

              <div
                className="group relative overflow-hidden rounded-2xl border border-primary/40 bg-transparent shadow-[0_0_35px_rgba(144,214,0,0.18)] backdrop-blur-sm"
                style={{ width: 280, height: 180 }}
              >
                <img
                  src={g.img}
                  alt={g.name}
                  loading="lazy"
                  width={800}
                  height={512}
                  className="h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
                  <span className="text-lg font-extrabold text-foreground drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]">
                    {g.name}
                  </span>
                  <span className="rounded-md border border-primary/50 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    RTP {g.rate}
                  </span>
                </div>
              </div>

              <button
                onClick={() => play(g.to)}
                style={{ width: 280 }}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/95 py-3 text-base font-bold text-black transition-transform active:scale-95"
              >
                <Play className="h-4 w-4" />
                اللعب الآن
              </button>
            </div>
          ))}
        </div>

        <p className="mt-14 text-center text-xs text-muted-foreground">
          كل الحقوق محفوظة لدى منصة crazy vip
        </p>
      </div>

      <ChoiceDialog
        open={choice !== null && !codeOpen}
        onClose={() => setChoice(null)}
        onUse={onUse}
        onGet={onGet}
      />
      <CodeDialog
        open={codeOpen}
        onClose={() => {
          setCodeOpen(false);
          clearAwaitingCode();
        }}
        onVerified={onVerified}
        onAdmin={() => {
          setCodeOpen(false);
          clearAwaitingCode();
          setChoice(null);
          navigate({ to: "/admin" });
        }}
      />

      <LoadingDialog open={loading} />
    </main>
  );
}
