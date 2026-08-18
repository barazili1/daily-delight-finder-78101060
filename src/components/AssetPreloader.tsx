import { useEffect, useState, type ReactNode } from "react";
import logo from "@/assets/logo.png";

// كل صور المشروع (src/assets) تتحمّل قبل ظهور الموقع
const assetModules = import.meta.glob<string>(
  "../assets/**/*.{png,jpg,jpeg,webp,gif,svg,avif}",
  { eager: true, import: "default", query: "?url" },
);

const IMAGE_URLS = [...new Set([...Object.values(assetModules), "/favicon.png"])];

function loadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
    if (img.complete) resolve();
  });
}

export function AssetPreloader({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const total = IMAGE_URLS.length;

  useEffect(() => {
    let cancelled = false;
    // احتياطي: لا نحبس المستخدم أكثر من 12 ثانية
    const timeout = setTimeout(() => !cancelled && setReady(true), 12000);

    Promise.all(
      IMAGE_URLS.map((src) =>
        loadImage(src).then(() => {
          if (!cancelled) setLoaded((n) => n + 1);
        }),
      ),
    ).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  if (!ready) {
    const pct = total ? Math.round((loaded / total) * 100) : 100;
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background px-8">
        <img
          src={logo}
          alt="CRAZY VIP"
          className="h-24 w-24 animate-pulse rounded-2xl object-contain"
        />
        <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-sm font-semibold text-muted-foreground" dir="rtl">
          جاري تحميل الموقع… {pct}%
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
