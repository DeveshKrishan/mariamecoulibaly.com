import type { ReactNode } from 'react';
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';

function ScrollToTop() {
  const { pathname } = useLocation();

  // Reset scroll before paint so a mid-page About view does not flash under
  // the new route (or leave Projects scrolled into empty space).
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <ScrollToTop />
      <Header />
      {/*
        Horizontal inset is owned by each page so About can full-bleed its
        dark hero while Projects/Home keep the reference site’s inset width.
      */}
      <main className="pt-[4.5rem]">{children}</main>
    </div>
  );
}
