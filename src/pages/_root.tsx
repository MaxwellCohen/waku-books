import type { ReactNode } from 'react';

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="bg-surface dark:bg-surface-dark text-black antialiased dark:text-white">{children}</body>
    </html>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
