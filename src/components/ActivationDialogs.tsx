import { useEffect, useState } from "react";
import { KeyRound, Ticket, ShieldCheck, Loader2, Clock, XCircle } from "lucide-react";
import { Overlay } from "@/components/Overlay";
import { supabase } from "@/integrations/supabase/client";
import {
  saveSession,
  addCodeToHistory,
  readCodeHistory,
  isCodeValid,
  type CodeHistoryItem,
  type ActiveSession,
} from "@/lib/session";

export const ADMIN_CODE = "HACKSD";


export function ChoiceDialog({
  open,
  onClose,
  onUse,
  onGet,
}: {
  open: boolean;
  onClose: () => void;
  onUse: () => void;
  onGet: () => void;
}) {
  const rows = [
    { label: "استخدام كود تفعيل", sub: "لديك كود من البوت", icon: KeyRound, action: onUse },
    { label: "الحصول على كود تفعيل", sub: "احصل على كود جديد", icon: Ticket, action: onGet },
  ];
  return (
    <Overlay open={open} onClose={onClose}>
      <h3 className="mb-4 text-center text-base font-black text-foreground">اختر طريقة الدخول</h3>
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <button
            key={r.label}
            onClick={r.action}
            className="group flex items-center gap-3 rounded-2xl border border-primary/35 bg-transparent p-3 text-left transition active:scale-[0.98] hover:border-primary"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/50 text-primary shadow-[0_0_18px_rgba(144,214,0,0.25)]">
              <r.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-foreground">{r.label}</span>
              <span className="block text-[11px] text-muted-foreground">{r.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </Overlay>
  );
}

export function CodeDialog({
  open,
  onClose,
  onVerified,
  onAdmin,
}: {
  open: boolean;
  onClose: () => void;
  onVerified: (s: ActiveSession) => void;
  onAdmin?: () => void;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CodeHistoryItem[]>([]);

  useEffect(() => {
    if (open) setHistory(readCodeHistory());
  }, [open]);

  const verifyCode = async (raw: string) => {
    const value = raw.trim();
    if (!value || busy) return;

    if (value.toUpperCase() === ADMIN_CODE) {
      sessionStorage.setItem("cvip_admin", ADMIN_CODE);
      onAdmin?.();
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const { data, error: rpcError } = await (
        supabase.rpc.bind(supabase) as unknown as (
          fn: string,
          args: Record<string, unknown>,
        ) => Promise<{
          data: { status: string; user_id: string | null; expires_at: string | null }[] | null;
          error: unknown;
        }>
      )("verify_activation_code", { _code: value });
      if (rpcError) throw rpcError;
      const res = data?.[0];
      if (res?.status === "ok") {
        const s = {
          code: value.toUpperCase(),
          userId: res.user_id ?? "",
          expiresAt: res.expires_at ?? "",
        };
        saveSession(s);
        addCodeToHistory(s);
        setHistory(readCodeHistory());
        onVerified(s);
      } else if (res?.status === "expired") {
        addCodeToHistory({ code: value.toUpperCase(), userId: "", expiresAt: "" });
        setHistory(readCodeHistory());
        setError("الكود صلاحيته منتهية");
      } else if (res?.status === "pending") {
        setError("بياناتك تحت المراجعة الآن");
      } else if (res?.status === "rejected") {
        setError("تم رفض الطلب");
      } else {
        setError("كود غير صحيح");
      }
    } catch {
      setError("حدث خطأ، حاول مجددًا");
    }
    setBusy(false);
  };

  return (
    <Overlay open={open} onClose={onClose}>
      <div className="mb-4 flex flex-col items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/50 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <h3 className="text-base font-black text-foreground">إدخال كود التفعيل</h3>
      </div>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="XXXX-XXXX-XXXX-XXXX"
        className="w-full rounded-xl border border-primary/40 bg-transparent px-3 py-3 text-center text-sm font-bold tracking-[0.15em] text-foreground outline-none focus:border-primary"
      />
      {error && <p className="mt-2 text-center text-xs font-bold text-red-400">{error}</p>}
      <button
        onClick={() => verifyCode(code)}
        disabled={busy}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/95 py-3 text-sm font-black text-black transition active:scale-95 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        التحقق
      </button>

      {history.length > 0 && (
        <div className="mt-5 border-t border-primary/20 pt-4" dir="rtl">
          <p className="mb-2 text-[11px] font-extrabold text-muted-foreground">
            الأكواد اللي استخدمتها
          </p>
          <div className="flex flex-col gap-2">
            {history.map((h) => {
              const valid = isCodeValid(h);
              return (
                <button
                  key={h.code}
                  onClick={() => valid && verifyCode(h.code)}
                  disabled={!valid || busy}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-right transition ${
                    valid
                      ? "border-primary/50 text-foreground active:scale-[0.98] hover:border-primary"
                      : "border-white/15 text-muted-foreground opacity-70"
                  }`}
                >
                  <span className="font-mono text-[11px] font-bold tracking-wider">{h.code}</span>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-black ${
                      valid ? "text-primary" : "text-red-400"
                    }`}
                  >
                    {valid ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {valid ? "صالح" : "منتهي"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Overlay>
  );

}
