export function Overlay({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose?: (() => void) | undefined;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-5 backdrop-blur-md">
      <button
        type="button"
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative w-full max-w-sm animate-scale-in rounded-3xl border border-primary/50 bg-black/90 p-5 shadow-[0_0_60px_rgba(144,214,0,0.25)]">
        {children}
      </div>
    </div>
  );
}
