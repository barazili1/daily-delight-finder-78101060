import { ChevronLeft, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Brand } from "@/components/Brand";

export function TopBar({ showBack = true }: { showBack?: boolean }) {
  const [online, setOnline] = useState(1284);
  const navigate = useNavigate();

  useEffect(() => {
    const rand = () => 1000 + Math.floor(Math.random() * 9001);
    setOnline(rand());
    const t = setInterval(() => setOnline(rand()), 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-primary/25 bg-transparent backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              type="button"
              aria-label="رجوع"
              onClick={() => navigate({ to: "/games" })}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-transparent text-primary transition-colors active:scale-95 hover:bg-primary/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <Brand className="text-lg" />
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-primary/30 px-3 py-1 text-[11px] font-semibold text-foreground/80">
          <Users className="h-3.5 w-3.5 text-primary" />
          users online : <span className="text-primary">{online}</span>
        </span>
      </div>
    </header>
  );
}
