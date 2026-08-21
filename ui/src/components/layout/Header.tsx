import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `hover:underline ${isActive ? 'underline' : ''}`;

/** Near-top band where the header must stay visible (Squarespace uses ~10px). */
const TOP_SHOW_Y = 10;

/**
 * Site header matching the reference Squarespace chrome:
 * - fixed + transparent at the top of the page
 * - solid white after scroll
 * - “scroll back”: hide while scrolling down (only after leaving the top),
 *   show while scrolling up — never hide while still near the top
 * - desktop inline nav; mobile two-line hamburger → full-screen overlay
 * - inverse (light) text when sitting over the About dark hero
 */
export function Header() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);
  const lastY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

  // Close the mobile menu and un-hide the bar when the route changes
  // (adjust state during render). SPA navigations often reset scroll to
  // the top without firing a scroll event, which previously left the bar
  // stuck hidden on mobile.
  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    setMenuOpen(false);
    setHidden(false);
    if (typeof window !== 'undefined') {
      // scrolled is derived from scroll position; sync it here too so the
      // solid/transparent chrome matches the new page immediately.
      setScrolled(window.scrollY > 8);
    }
  }

  const overDarkHero = pathname === '/about-me' && !scrolled && !menuOpen;

  useEffect(() => {
    const syncFromScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);

      // Always show near the top — matches Squarespace scroll-back, which
      // never hides until scrollY > 10. Also covers scroll restoration that
      // jumps to 0 without a directional scroll event.
      if (y <= TOP_SHOW_Y) {
        setHidden(false);
      } else if (y > lastY.current) {
        setHidden(true);
      } else if (y < lastY.current) {
        setHidden(false);
      }

      lastY.current = y;
    };

    syncFromScroll();
    window.addEventListener('scroll', syncFromScroll, { passive: true });
    return () => window.removeEventListener('scroll', syncFromScroll);
  }, []);

  // Keep the scroll cursor aligned after navigations so the next downward
  // scroll is measured from the new page position.
  useEffect(() => {
    lastY.current = window.scrollY;
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
    // Avoid `translate-y-0` while the menu is open: any transform on the
    // header makes `position:fixed` descendants use the header as their
    // containing block, so the overlay collapses to the bar height and
    // page content shows through the mobile menu.
    hidden && !menuOpen ? '-translate-y-full' : '',
    menuOpen || scrolled
      ? 'bg-white text-ink shadow-[0_1px_0_rgba(21,9,9,0.06)]'
      : 'bg-transparent text-ink',
    overDarkHero ? 'text-white' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={shellClass}>
      <div className="relative z-50 mx-auto flex max-w-[1280px] items-center justify-between px-[5vw] py-4">
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
          className="fixed inset-x-0 top-0 bottom-0 z-40 bg-white text-ink md:hidden"
        >
          <nav
            className="flex h-full flex-col gap-6 px-[5vw] pt-24 font-heading text-2xl"
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
