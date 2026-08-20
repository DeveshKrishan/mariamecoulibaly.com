import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `hover:underline ${isActive ? 'underline' : ''}`;

/**
 * Site header matching the reference Squarespace chrome:
 * - fixed + transparent at the top of the page
 * - solid white after scroll
 * - “scroll back”: hide while scrolling down, show while scrolling up
 * - desktop inline nav; mobile two-line hamburger → full-screen overlay
 * - inverse (light) text when sitting over the About dark hero
 */
export function Header() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  const overDarkHero = pathname === '/about-me' && !scrolled && !menuOpen;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (y > lastY.current && y > 64) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastY.current = y;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const shellClass = [
    'fixed top-0 left-0 right-0 z-50 transition-[transform,background-color,color,box-shadow] duration-300 ease-out',
    hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0',
    menuOpen || scrolled
      ? 'bg-white text-ink shadow-[0_1px_0_rgba(21,9,9,0.06)]'
      : 'bg-transparent text-ink',
    overDarkHero ? 'text-white' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={shellClass}>
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-[5vw] py-4">
        <NavLink
          to="/"
          className="font-heading text-lg font-bold tracking-tight"
          onClick={() => setMenuOpen(false)}
        >
          Mariam Coulibaly
        </NavLink>

        <nav
          className="hidden gap-6 text-sm tracking-wide md:flex"
          aria-label="Primary"
        >
          <NavLink to="/about-me" className={navLinkClass}>
            About Me
          </NavLink>
          <NavLink to="/" className={navLinkClass} end>
            Projects
          </NavLink>
        </nav>

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {/* Two-line hamburger matching the reference site’s doubleLine icon */}
          <span className="sr-only">{menuOpen ? 'Close' : 'Menu'}</span>
          <span
            aria-hidden="true"
            className={[
              'absolute block h-[2px] w-5 bg-current transition-transform duration-300',
              menuOpen ? 'translate-y-0 rotate-45' : '-translate-y-[4px]',
            ].join(' ')}
          />
          <span
            aria-hidden="true"
            className={[
              'absolute block h-[2px] w-5 bg-current transition-transform duration-300',
              menuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-[4px]',
            ].join(' ')}
          />
        </button>
      </div>

      {menuOpen ? (
        <div
          id="mobile-nav"
          className="fixed inset-0 top-[3.5rem] z-40 bg-white text-ink md:hidden"
        >
          <nav
            className="flex h-full flex-col gap-6 px-[5vw] pt-10 font-heading text-2xl"
            aria-label="Mobile"
          >
            <NavLink
              to="/about-me"
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              About Me
            </NavLink>
            <NavLink
              to="/"
              className={navLinkClass}
              end
              onClick={() => setMenuOpen(false)}
            >
              Projects
            </NavLink>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
