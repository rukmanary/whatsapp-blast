import { useEffect } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  message: string;
  open: boolean;
  durationMs?: number;
  onClose: () => void;
};

export function Toast({ message, open, durationMs = 2200, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const t = globalThis.setTimeout(() => onClose(), durationMs);
    return () => globalThis.clearTimeout(t);
  }, [durationMs, onClose, open]);

  if (!open) return null;

  return createPortal(
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>,
    document.body
  );
}

