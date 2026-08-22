import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useEditMode } from '../../lib/editMode';
import { shouldCloseMobileMenuOnClick } from './mobileNav';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `hover:underline ${isActive ? 'underline' : ''}`;

/**
 * Site header matching the reference Squarespace chrome:
 * - fixed + transparent at the top of the page
 * - solid after scroll (white on most pages; dark-accent blue on About)
 * - “scroll back”: hide while scrolling down, show while scrolling up
 * - desktop inline nav; mobile two-line hamburger → full-screen overlay
 * - inverse (light) text when sitting over the About dark hero / solid About bar
 */
export function Header() {
  const { pathname } = useLocation();
  const { editMode, setEditMode, canEdit } = useEditMode();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);
  const lastY = useRef(0);

  // Close the mobile menu when the route changes (adjust state during render).
  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    setMenuOpen(false);
  }

  const onAbout = pathname === '/about-me';
  // Light nav text over the About hero (transparent) and the solid blue bar.
  const aboutInverse = onAbout && !menuOpen;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      // Near the top always show (Squarespace-like ~10px band).
      if (y <= 10) {
        setHidden(false);
      } else if (y > lastY.current && y > 64) {
        setHidden(true);
      } else if (y < lastY.current) {
        setHidden(false);
      }
      lastY.current = y;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Un-hide and resync chrome on route change before paint. Must match
  // ScrollToTop’s useLayoutEffect timing so a mid-page → new-route nav does
  // not paint one frame of scrolled chrome (e.g. solid white on About hero).
  useLayoutEffect(() => {
    const y = window.scrollY;
    setHidden(false);
    setScrolled(y > 8);
    lastY.current = y;
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  let chromeBg = 'bg-transparent text-ink';
  if (menuOpen) {
    chromeBg = 'bg-white text-ink shadow-[0_1px_0_rgba(21,9,9,0.06)]';
  } else if (scrolled && onAbout) {
    // Keep the About solid bar on the hero dark-accent blue (not white).
    chromeBg = 'bg-dark-accent text-white shadow-[0_1px_0_rgba(0,0,0,0.12)]';
  } else if (scrolled) {
    chromeBg = 'bg-white text-ink shadow-[0_1px_0_rgba(21,9,9,0.06)]';
  }

  const shellClass = [
    'fixed top-0 left-0 right-0 z-50 transition-[transform,background-color,color,box-shadow] duration-300 ease-out',
    // Avoid `translate-y-0` while the menu is open: any transform on the
    // header makes `position:fixed` descendants use the header as their
    // containing block, so the overlay collapses to the bar height and
    // page content shows through the mobile menu.
    hidden && !menuOpen ? '-translate-y-full' : '',
    chromeBg,
    // Transparent About top: force light text over the dark hero.
    aboutInverse && !scrolled ? 'text-white' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const editSuffix = editMode ? '?edit=1' : '';
  const homeTo = `/${editSuffix}`;
  const aboutTo = `/about-me${editSuffix}`;

  // Keep the mobile overlay up until the route actually changes. Closing it
  // in the same click that navigates paints one frame of the *old* page under
  // the departing menu (visible flicker on mobile). Same-route taps still
  // need an explicit close because pathname will not update.
  const closeMenuIfCurrent = (targetPath: string) => () => {
    if (shouldCloseMobileMenuOnClick(pathname, targetPath)) {
      setMenuOpen(false);
    }
  };

  const editControl = canEdit ? (
      <button
        type="button"
        className="text-sm tracking-wide hover:underline"
        onClick={() => {
          setEditMode(!editMode);
          setMenuOpen(false);
        }}
      >
        {editMode ? 'Exit edit' : 'Edit'}
      </button>
    ) : null;

  return (
    <header className={shellClass}>
      <div className="relative z-50 mx-auto flex max-w-[1280px] items-center justify-between px-[5vw] py-4">
        <NavLink
          to={homeTo}
          className="font-heading text-lg font-bold tracking-tight"
          onClick={closeMenuIfCurrent('/')}
        >
          Mariam Coulibaly
        </NavLink>

        <nav
          className="hidden gap-6 text-sm tracking-wide md:flex"
          aria-label="Primary"
        >
          <NavLink to={aboutTo} className={navLinkClass}>
            About Me
          </NavLink>
          <NavLink to={homeTo} className={navLinkClass} end>
            Projects
          </NavLink>
          {editControl}
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
              to={aboutTo}
              className={navLinkClass}
              onClick={closeMenuIfCurrent('/about-me')}
            >
              About Me
            </NavLink>
            <NavLink
              to={homeTo}
              className={navLinkClass}
              end
              onClick={closeMenuIfCurrent('/')}
            >
              Projects
            </NavLink>
            {editControl}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
