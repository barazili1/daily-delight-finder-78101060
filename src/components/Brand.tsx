export function Brand({ className = "" }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-wide ${className}`}>
      <span className="text-primary drop-shadow-[0_0_10px_rgba(144,214,0,0.6)]">CRAZY</span>{" "}
      <span className="text-foreground">VIP</span>
    </span>
  );
}
