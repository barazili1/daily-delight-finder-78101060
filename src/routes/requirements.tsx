import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  clearAwaitingCode,
  ensureUserId,
  isAwaitingCode,
  readPendingGame,
} from "@/lib/session";
import {
  Copy,
  Check,
  ImagePlus,
  ShieldCheck,
  Download,
  Send,
  Ticket,
  Wallet,
  Camera,
  Lock,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Logo } from "@/components/Logo";
import { LoadingDialog } from "@/components/LoadingDialog";
import { Brand } from "@/components/Brand";
import { VerifySequenceDialog } from "@/components/VerifySequenceDialog";
import { CodeDialog } from "@/components/ActivationDialogs";
import imgDownload from "@/assets/step-download.jpg";
import imgTelegram from "@/assets/step-telegram.jpg";
import imgPromo from "@/assets/step-promo.jpg";
import imgDeposit from "@/assets/step-deposit.jpg";
import imgUpload from "@/assets/step-upload.jpg";

export const Route = createFileRoute("/requirements")({
  validateSearch: (search: Record<string, unknown>) => ({
    platform: typeof search["platform"] === "string" ? (search["platform"] as string) : "1xBet",
  }),
  head: () => ({
    meta: [
      { title: "الشروط المطلوبة — CRAZY VIP" },
      {
        name: "description",
        content:
          "أكمل شروط التفعيل: التحميل، الانضمام للقناة، التسجيل بالبروموكود KAJO117 والإيداع ورفع الإثباتات.",
      },
      { property: "og:title", content: "الشروط المطلوبة — CRAZY VIP" },
      { property: "og:description", content: "خطوات إتمام التفعيل مع CRAZY VIP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequirementsPage,
});

const PROMO = "KAJO117";

const PLATFORM_LINKS: Record<string, string> = {
  "1xBet": "https://reffpa.com/L?tag=d_2845435m_27409c_&site=2845435&ad=27409",
  LineBet: "https://lb-aff.com//L?tag=d_3386416m_66803c_apk1&site=3386416&ad=66803",
  GreenBet: "https://refpa79184.com/L?tag=d_5982434m_132250c_&site=5982434&ad=132250",
  WinWin: "https://refpa49781.com/L?tag=d_5981657m_68383c_&site=5981657&ad=68383",
};

/* ---------- shared bits ---------- */

function Ring({ value }: { value: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 72 72" className="h-[72px] w-[72px] -rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="hsl(0 0% 100% / 0.12)" strokeWidth="5" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="#90D600"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * value) / 100}
        style={{ transition: "stroke-dashoffset .6s ease", filter: "drop-shadow(0 0 6px #90D600)" }}
      />
    </svg>
  );
}

function ActionBtn({
  label,
  icon: Icon,
  done,
  onClick,
  tone = "white",
}: {
  label: string;
  icon: React.ElementType;
  done: boolean;
  onClick: () => void;
  tone?: "white" | "lime";
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "group flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-extrabold transition active:scale-[0.97]",
        done
          ? "border border-primary/60 bg-transparent text-primary"
          : tone === "lime"
            ? "text-black"
            : "border border-white/70 bg-white/95 text-black",
      ].join(" ")}
      style={!done && tone === "lime" ? { backgroundColor: "#90D600" } : undefined}
    >
      {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      {done ? "تم" : label}
    </button>
  );
}

function StepBlock({
  index,
  total,
  title,
  hint,
  image,
  icon: Icon,
  done,
  children,
}: {
  index: number;
  total: number;
  title: string;
  hint: string;
  image: string;
  icon: React.ElementType;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="relative pl-12">
      {/* rail */}
      <span
        aria-hidden
        className={`absolute left-[19px] top-11 bottom-0 w-px ${
          index === total ? "hidden" : done ? "bg-primary/70" : "bg-primary/20"
        }`}
      />
      {/* node */}
      <span
        className={`absolute left-0 top-2 flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-black ${
          done
            ? "border-primary bg-primary/15 text-primary"
            : "border-primary/30 text-muted-foreground"
        }`}
        style={done ? { boxShadow: "0 0 18px #90D60055" } : undefined}
      >
        {done ? <Check className="h-5 w-5" /> : String(index).padStart(2, "0")}
      </span>

      <article className="overflow-hidden rounded-2xl border border-primary/25 bg-transparent backdrop-blur-sm">
        <header className="flex items-center gap-3 border-b border-primary/15 p-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-primary/30">
            <img
              src={image}
              alt={title}
              loading="lazy"
              width={512}
              height={512}
              className="h-full w-full object-cover opacity-90"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <Icon className="absolute bottom-1 left-1 h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              step {index} / {total}
            </p>
            <h2 className="text-sm font-bold leading-snug text-foreground">{title}</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
          </div>
        </header>
        <div className="p-3">{children}</div>
      </article>
    </li>
  );
}

function Upload({
  index,
  label,
  onPicked,
}: {
  index: number;
  label: string;
  onPicked: (file: File) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <label className="group relative flex h-32 flex-1 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-primary/50 bg-transparent">
      {preview ? (
        <>
          <img src={preview} alt={`إثبات ${index}`} className="h-full w-full object-cover" />
          <span className="absolute right-1.5 top-1.5 rounded-full bg-primary p-1 text-primary-foreground">
            <Check className="h-3 w-3" />
          </span>
        </>
      ) : (
        <>
          <ImagePlus className="h-7 w-7 text-primary" />
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setPreview(URL.createObjectURL(f));
            onPicked(f);
          }
        }}
      />
    </label>
  );
}

/* ---------- page ---------- */

function RequirementsPage() {
  const { platform } = Route.useSearch();
  const navigate = useNavigate();
  const [codeOpen, setCodeOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seqOpen, setSeqOpen] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [shots, setShots] = useState<(File | null)[]>([null, null]);

  const shotCount = shots.filter(Boolean).length;

  // The user left to the Telegram bot — when they come back, send them
  // to the first page instead of opening the code input.
  useEffect(() => {
    const onBack = () => {
      if (document.visibilityState !== "visible") return;
      if (!isAwaitingCode()) return;
      clearAwaitingCode();
      setSeqOpen(false);
      setCodeOpen(false);
      navigate({ to: "/games" });
    };
    document.addEventListener("visibilitychange", onBack);
    window.addEventListener("focus", onBack);
    onBack();
    return () => {
      document.removeEventListener("visibilitychange", onBack);
      window.removeEventListener("focus", onBack);
    };
  }, []);


  const mark = (k: string) => setDone((d) => ({ ...d, [k]: true }));

  const openPlatform = (k: string) => {
    const url = PLATFORM_LINKS[platform] ?? PLATFORM_LINKS["1xBet"];
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    mark(k);
  };

  const completed = useMemo(
    () =>
      ["download", "telegram", "register", "deposit"].filter((k) => done[k]).length +
      (shotCount >= 2 ? 1 : 0),
    [done, shotCount],
  );
  const progress = Math.round((completed / 5) * 100);
  const allDone = shotCount >= 2;

  const copy = async () => {
    await navigator.clipboard.writeText(PROMO);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const verify = async () => {
    setLoading(true);
    try {
      const uid = ensureUserId();
      const paths: string[] = [];
      for (let i = 0; i < 2; i++) {
        const file = shots[i];
        if (!file) continue;
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${uid}/${Date.now()}-${i}.${ext}`;
        await supabase.storage.from("proofs").upload(path, file, { upsert: true });
        paths.push(path);
      }
      if (paths.length === 2) {
        await (
          supabase.rpc.bind(supabase) as unknown as (
            fn: string,
            args: Record<string, unknown>,
          ) => Promise<{ data: unknown; error: unknown }>
        )("submit_proof", { _user_id: uid, _img1: paths[0], _img2: paths[1] });
      }
    } catch {
      /* ignore upload errors, continue the flow */
    }
    setLoading(false);
    setSeqOpen(true);
  };

  return (
    <main dir="ltr" className="relative z-10 min-h-screen bg-transparent pb-32">
      <TopBar />

      <div className="mx-auto max-w-md px-4 pt-6">
        <Logo size={96} />
        <h1 className="mt-3 text-center text-xl">
          <Brand />
        </h1>

        {/* progress header */}
        <section className="mt-5 flex items-center gap-4 rounded-2xl border border-primary/25 bg-transparent p-4 backdrop-blur-sm">
          <div className="relative shrink-0">
            <Ring value={progress} />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-primary">
              {progress}%
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-foreground">الشروط المطلوبة</h2>
            <p className="text-xs text-muted-foreground">
              أكمل {5 - completed > 0 ? `${5 - completed} خطوات متبقية` : "كل الخطوات"} لتفعيل حسابك
              على منصة <span className="font-bold text-primary">{platform}</span>
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, backgroundColor: "#90D600", boxShadow: "0 0 10px #90D600" }}
              />
            </div>
          </div>
        </section>

        {/* steps */}
        <ol className="mt-6 space-y-5">
          <StepBlock
            index={1}
            total={5}
            title={`تحميل منصة ${platform}`}
            hint="حمّل التطبيق الرسمي من الرابط"
            image={imgDownload}
            icon={Download}
            done={!!done["download"]}
          >
            <ActionBtn
              label="تحميل"
              icon={Download}
              done={!!done["download"]}
              onClick={() => openPlatform("download")}
            />
          </StepBlock>

          <StepBlock
            index={2}
            total={5}
            title="الانضمام إلى قناة التليجرام"
            hint="تابع القناة للحصول على الأكواد"
            image={imgTelegram}
            icon={Send}
            done={!!done["telegram"]}
          >
            <ActionBtn
              label="انضمام الآن"
              icon={Send}
              done={!!done["telegram"]}
              onClick={() => mark("telegram")}
            />
          </StepBlock>

          <StepBlock
            index={3}
            total={5}
            title={`إنشاء حساب جديد باستخدام البروموكود الخاص بمنصة ${platform}`}
            hint="لا تنسَ إدخال البروموكود أثناء التسجيل"
            image={imgPromo}
            icon={Ticket}
            done={!!done["register"]}
          >
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-dashed border-primary/60 bg-transparent p-2">
              <Ticket className="ml-1 h-4 w-4 text-primary" />
              <span className="flex-1 text-center text-lg font-black tracking-[0.35em] text-primary">
                {PROMO}
              </span>
              <button
                onClick={copy}
                className="rounded-lg px-3 py-2 text-primary-foreground transition active:scale-90"
                style={{ backgroundColor: "#90D600" }}
                aria-label="نسخ البروموكود"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <ActionBtn
              label="التسجيل الآن"
              icon={Ticket}
              done={!!done["register"]}
              onClick={() => openPlatform("register")}
            />
          </StepBlock>

          <StepBlock
            index={4}
            total={5}
            title="إيداع مبلغ بحد أدنى"
            hint="اختر العملة المناسبة لك"
            image={imgDeposit}
            icon={Wallet}
            done={!!done["deposit"]}
          >
            <div className="mb-3 grid grid-cols-2 gap-3">
              {["300 جنيه", "6 دولار"].map((v) => (
                <div
                  key={v}
                  className="rounded-xl border border-primary/40 py-3 text-center text-base font-extrabold text-primary"
                >
                  {v}
                </div>
              ))}
            </div>
            <ActionBtn
              label="تأكيد الإيداع"
              icon={Wallet}
              tone="lime"
              done={!!done["deposit"]}
              onClick={() => mark("deposit")}
            />
          </StepBlock>

          <StepBlock
            index={5}
            total={5}
            title="رفع صور الإثبات"
            hint="صورة الحساب وصورة الإيداع"
            image={imgUpload}
            icon={Camera}
            done={shotCount >= 2}
          >
            <div className="flex gap-3">
              <Upload
                index={1}
                label="صورة الحساب"
                onPicked={(f) => setShots((s) => [f, s[1] ?? null])}
              />
              <Upload
                index={2}
                label="صورة الإيداع"
                onPicked={(f) => setShots((s) => [s[0] ?? null, f])}
              />
            </div>
          </StepBlock>
        </ol>
      </div>

      {/* sticky verify bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-primary/20 bg-background/70 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto max-w-md">
          <button
            onClick={verify}
            
            className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-extrabold transition active:scale-[0.97] ${
              allDone
                ? "border border-white/70 bg-white/95 text-black"
                : "border border-white/20 bg-white/10 text-muted-foreground"
            }`}
          >
            {allDone ? <ShieldCheck className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
            التحقق من الشروط
          </button>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            كل الحقوق محفوظة لدى منصة crazy vip
          </p>
        </div>
      </div>

      <LoadingDialog open={loading} />
      <VerifySequenceDialog open={seqOpen} onClose={() => setSeqOpen(false)} />
      <CodeDialog
        open={codeOpen}
        onClose={() => {
          setCodeOpen(false);
          clearAwaitingCode();
        }}
        onVerified={() => {
          setCodeOpen(false);
          clearAwaitingCode();
          const to = readPendingGame() || "/games";
          setLoading(true);
          setTimeout(() => navigate({ to }), 1500);
        }}
        onAdmin={() => {
          setCodeOpen(false);
          clearAwaitingCode();
          navigate({ to: "/admin" });
        }}
      />
    </main>
  );
}
