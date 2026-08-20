import type { ReactNode } from 'react';
import { Header } from './Header';

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      {/*
        Horizontal inset is owned by each page so About can full-bleed its
        dark hero while Projects/Home keep the reference site’s inset width.
      */}
      <main className="pt-[4.5rem]">{children}</main>
    </div>
  );
}
