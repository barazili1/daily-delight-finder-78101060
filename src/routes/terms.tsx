import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Headphones, KeyRound, Play, Send, ShieldCheck, Youtube } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Logo } from "@/components/Logo";
import { LoadingDialog } from "@/components/LoadingDialog";
import { Brand } from "@/components/Brand";
import { saveUserId } from "@/lib/session";
import logo1xBet from "@/assets/platform-1xbet.png";
import logoLineBet from "@/assets/platform-linebet.png";
import logoWinWin from "@/assets/platform-winwin.png";
import logoGreenBet from "@/assets/platform-greenbet.png";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "الشروط — CRAZY VIP" },
      { name: "description", content: "أدخل الـ ID واختر المنصة للحصول على كود التفعيل الخاص بك من CRAZY VIP." },
      { property: "og:title", content: "الشروط — CRAZY VIP" },
      { property: "og:description", content: "خطوات الحصول على كود التفعيل من CRAZY VIP." },
    ],
  }),
  component: TermsPage,
});

const PLATFORMS = [
  { name: "1xBet", logo: logo1xBet },
  { name: "LineBet", logo: logoLineBet },
  { name: "WinWin", logo: logoWinWin },
  { name: "GreenBet", logo: logoGreenBet },
];

function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && setShown(true),
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-10 scale-[0.97] opacity-0"}`}
    >
      {children}
    </div>
  );
}

function TimelineStep({
  n,
  label,
  active,
  done,
  children,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <div className="relative pl-10">
        {/* rail */}
        <span className="absolute left-[15px] top-9 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-primary/50 to-transparent" />
        <span
          className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black transition-all ${
            done || active
              ? "border-primary text-primary shadow-[0_0_20px_rgba(144,214,0,0.35)]"
              : "border-border text-muted-foreground"
          }`}
        >
          {done ? <Check className="h-4 w-4" /> : n}
        </span>

        <p className="mb-3 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          {label}
        </p>
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-transparent p-4 backdrop-blur-[2px]">
          <span className="pointer-events-none absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-primary/80 via-primary/20 to-transparent" />
          {children}
        </div>
      </div>
    </Reveal>
  );
}

function TermsPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [platform, setPlatform] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasId = Boolean(userId.trim());
  const ready = hasId && Boolean(platform);

  const submit = () => {
    if (!ready || !platform) return;
    saveUserId(userId.trim());
    setLoading(true);
    setTimeout(() => navigate({ to: "/requirements", search: { platform } }), 3000);
  };

  return (
    <main dir="ltr" className="relative z-10 min-h-screen bg-transparent pb-16">
      <TopBar />

      <div className="mx-auto max-w-md px-4 pt-6">
        {/* hero */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/25 p-5 text-center backdrop-blur-[2px]">
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(144,214,0,0.18),transparent_65%)]" />
          <div className="relative">
            <Logo size={96} />
            <h1 className="mt-3 text-2xl">
              <Brand />
            </h1>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              <KeyRound className="h-3 w-3 text-primary" /> activation
            </p>
          </div>
        </div>

        {/* steps timeline */}
        <div className="mt-8 space-y-8">
          <TimelineStep n={1} label="step 01 — tutorial" active done={false}>
            <div
              className="relative mx-auto overflow-hidden rounded-xl border border-primary/40 bg-transparent"
              style={{ width: 280, height: 180 }}
            >
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(144,214,0,0.12)_50%,transparent_60%)]" />
              <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/60 text-primary shadow-[0_0_24px_rgba(144,214,0,0.35)]">
                  <Play className="h-5 w-5 fill-current" />
                </span>
                <p className="text-xs text-muted-foreground">فيديو الشرح — أرسل لي الرابط لإضافته</p>
              </div>
            </div>
          </TimelineStep>

          <TimelineStep n={2} label="step 02 — your id" active={!hasId} done={hasId}>
            <p className="mb-3 text-sm font-bold text-foreground">للحصول على كود تفعيل</p>
            <input
              inputMode="numeric"
              value={userId}
              onChange={(e) => setUserId(e.target.value.replace(/\D/g, ""))}
              placeholder="أدخل الـ ID الخاص بك"
              className="w-full rounded-xl border border-primary/40 bg-transparent px-4 py-3 text-center text-lg tracking-[0.25em] text-foreground outline-none placeholder:text-sm placeholder:tracking-normal placeholder:text-muted-foreground focus:border-primary focus:shadow-[0_0_22px_rgba(144,214,0,0.25)]"
            />
          </TimelineStep>

          <TimelineStep n={3} label="step 03 — platform" active={hasId && !platform} done={Boolean(platform)}>
            <div className="flex flex-wrap justify-center gap-3">
              {PLATFORMS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setPlatform(p.name)}
                  style={{ width: 150, height: 80 }}
                  className={`group relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border bg-transparent text-sm font-black transition-all active:scale-95 ${
                    platform === p.name
                      ? "border-primary text-primary shadow-[0_0_26px_rgba(144,214,0,0.35)]"
                      : "border-border text-foreground/80 hover:border-primary/50"
                  }`}
                >
                  {platform === p.name && <span className="absolute inset-0 bg-primary/10" />}
                  <img
                    src={p.logo}
                    alt={`${p.name} logo`}
                    loading="lazy"
                    width={96}
                    height={40}
                    className="relative z-10 h-9 w-24 object-contain"
                  />
                  <span className="relative z-10">{p.name}</span>
                  {platform === p.name && (
                    <span className="absolute right-2 top-2 z-10 rounded-full bg-primary p-1">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </TimelineStep>
        </div>

        {/* actions */}
        <Reveal>
          <div className="mt-10 flex gap-3">
            <a
              href="https://t.me/A_R_1_R"
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/95 py-3.5 text-sm font-bold text-black transition active:scale-95"
            >
              <Headphones className="h-4 w-4" /> التواصل مع الدعم
            </a>
            <button
              onClick={submit}
              disabled={!ready}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-primary-foreground transition active:scale-95 disabled:opacity-40"
              style={{
                backgroundColor: "#90D600",
                boxShadow: ready ? "0 0 30px rgba(144,214,0,0.5)" : "none",
              }}
            >
              <ShieldCheck className="h-4 w-4" /> الحصول على كود تفعيل
            </button>
          </div>
        </Reveal>

        {/* socials */}
        <div className="mt-14 flex gap-3">
          <a
            href="https://t.me/IIIIIIIIIIIIIIIIIIIIII00"
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-transparent py-3 text-sm font-bold text-foreground backdrop-blur-sm transition hover:border-primary"
          >
            <Send className="h-4 w-4 text-primary" /> Telegram channel
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-transparent py-3 text-sm font-bold text-foreground backdrop-blur-sm transition hover:border-primary"
          >
            <Youtube className="h-4 w-4 text-primary" /> Youtube channel
          </a>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          كل الحقوق محفوظة لدى منصة crazy vip
        </p>
      </div>

      <LoadingDialog open={loading} />
    </main>
  );
}
