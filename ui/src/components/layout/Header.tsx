import { NavLink } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `hover:underline ${isActive ? 'underline' : ''}`;

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5vw] py-4 bg-white/90 backdrop-blur">
      <NavLink to="/" className="font-heading text-lg font-bold tracking-tight">
        Mariam Coulibaly
      </NavLink>
      <nav className="flex gap-6 text-sm uppercase tracking-wide">
        <NavLink to="/" className={navLinkClass} end>
          Projects
        </NavLink>
        <NavLink to="/about-me" className={navLinkClass}>
          About Me
        </NavLink>
      </nav>
    </header>
  );
}
