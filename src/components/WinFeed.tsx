import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

type Row = { id: number; user: string; bet: number; win: number };

function maskId() {
  const a = 20 + Math.floor(Math.random() * 79);
  const b = 10 + Math.floor(Math.random() * 89);
  return `${a}*******${b}`;
}

function makeRow(id: number): Row {
  const bet = [50, 100, 150, 200, 250, 300, 500][Math.floor(Math.random() * 7)]!;
  const mult = 1.4 + Math.random() * 14;
  return { id, user: maskId(), bet, win: Math.round(bet * mult) };
}

export function WinFeed() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    setRows(Array.from({ length: 6 }, (_, i) => makeRow(i)));
    let n = 100;
    const t = setInterval(() => {
      setRows((r) => [makeRow(n++), ...r].slice(0, 6));
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-primary/30 bg-transparent backdrop-blur-sm">
      <header className="flex items-center gap-2 border-b border-primary/20 px-3 py-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground">
          live wins
        </span>
        <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> LIVE
        </span>
      </header>
      <div className="grid grid-cols-3 border-b border-primary/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <span>User id</span>
        <span className="text-center">Bet</span>
        <span className="text-right">Win</span>
      </div>
      <ul>
        {rows.map((r) => (
          <li
            key={r.id}
            className="grid animate-fade-in grid-cols-3 items-center px-3 py-2 text-xs odd:bg-white/[0.03]"
          >
            <span className="font-mono text-foreground/80">{r.user}</span>
            <span className="text-center font-bold text-foreground/70">{r.bet}</span>
            <span className="text-right font-black text-primary">{r.win}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
