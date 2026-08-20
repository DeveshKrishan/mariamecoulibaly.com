import type { ReactNode } from 'react';
import { Header } from './Header';

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen max-w-[1280px] mx-auto">
      <Header />
      <main className="pt-24 px-[5vw]">{children}</main>
    </div>
  );
}
