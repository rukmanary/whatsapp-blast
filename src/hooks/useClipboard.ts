import { useCallback, useState } from 'react';

export function useClipboard() {
  const [lastError, setLastError] = useState<string>('');
  const [lastCopiedAt, setLastCopiedAt] = useState<number>(0);

  const copyText = useCallback(async (text: string) => {
    try {
      setLastError('');
      await navigator.clipboard.writeText(text);
      setLastCopiedAt(Date.now());
      return true;
    } catch (e) {
      setLastError(e instanceof Error ? e.message : 'Copy failed');
      return false;
    }
  }, []);

  return { copyText, lastError, lastCopiedAt };
}

