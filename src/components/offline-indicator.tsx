'use client';

import { WifiOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

function useOffline() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return offline;
}

export function OfflineIndicator() {
  const offline = useOffline();
  const toastId = useRef<number | string | undefined>(undefined);

  useEffect(() => {
    if (offline) {
      toastId.current = toast.error("You're offline — reconnecting…", {
        duration: Infinity,
        icon: <WifiOff aria-hidden className="size-4" />,
      });
    } else if (toastId.current !== undefined) {
      toast.dismiss(toastId.current);
      toastId.current = undefined;
    }
  }, [offline]);

  return null;
}
