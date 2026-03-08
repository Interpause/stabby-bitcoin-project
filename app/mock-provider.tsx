'use client';

import { useEffect, useState } from 'react';

export function MockProvider({
  children,
  isEnabled,
}: {
  children: React.ReactNode;
  isEnabled: boolean;
}) {
  const [mockingReady, setMockingReady] = useState(!isEnabled);

  useEffect(() => {
    if (isEnabled) {
      const init = async () => {
        const { worker } = await import('@/lib/msw/browser');
        await worker.start({ onUnhandledRequest: 'bypass' });
        setMockingReady(true);
      };
      init();
    }
  }, [isEnabled]);

  if (!mockingReady) return null;

  return <>{children}</>;}
