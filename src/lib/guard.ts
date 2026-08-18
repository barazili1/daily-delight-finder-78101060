import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { readSession, savePendingGame } from "./session";

/** Kicks the user back to the games page when there is no valid activation session. */
export function useRequireSession() {
  const navigate = useNavigate();
  useEffect(() => {
    let warned = false;
    const check = () => {
      if (readSession()) return;
      if (!warned) {
        warned = true;
        savePendingGame(window.location.pathname);
        toast.error("لا يمكنك الدخول للعبة بدون كود تفعيل", {
          description: "اختر اللعبة من الصفحة الرئيسية وأدخل كود التفعيل الخاص بك.",
        });
      }
      navigate({ to: "/games" });
    };
    check();
    const t = setInterval(check, 5000);
    return () => clearInterval(t);
  }, [navigate]);
}
