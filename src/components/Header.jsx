import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/profile', label: 'Profile' },
  { to: '/alamat', label: '?????  ' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header>
        <div className="topbar">
          <div className="logo">ELTRI</div>
          <div className="socials">
            <a href="https://www.instagram.com/eltriputra?stkn=cDE5ZXllNXB4dHNo" aria-label="Instagram">
              <svg viewBox="0 0 24 24"><path d="M12 2c-2.7 0-3.05.01-4.12.06-1.07.05-1.8.22-2.43.47-.66.26-1.22.6-1.77 1.16-.56.55-.9 1.11-1.16 1.77-.25.63-.42 1.36-.47 2.43C2 8.95 2 9.3 2 12s.01 3.05.06 4.12c.05 1.07.22 1.8.47 2.43.26.66.6 1.22 1.16 1.77.55.56 1.11.9 1.77 1.16.63.25 1.36.42 2.43.47C8.95 22 9.3 22 12 22s3.05-.01 4.12-.06c1.07-.05 1.8-.22 2.43-.47.66-.26 1.22-.6 1.77-1.16.56-.55.9-1.11 1.16-1.77.25-.63.42-1.36.47-2.43.05-1.07.06-1.42.06-4.12s-.01-3.05-.06-4.12c-.05-1.07-.22-1.8-.47-2.43a4.9 4.9 0 0 0-1.16-1.77 4.9 4.9 0 0 0-1.77-1.16c-.63-.25-1.36-.42-2.43-.47C15.05 2.01 14.7 2 12 2Zm0 1.8c2.65 0 2.96.01 4.01.06.97.04 1.5.2 1.85.34.46.18.79.4 1.14.75.35.35.57.68.75 1.14.14.35.3.88.34 1.85.05 1.05.06 1.36.06 4.01s-.01 2.96-.06 4.01c-.04.97-.2 1.5-.34 1.85-.18.46-.4.79-.75 1.14-.35.35-.68.57-1.14.75-.35.14-.88.3-1.85.34-1.05.05-1.36.06-4.01.06s-2.96-.01-4.01-.06c-.97-.04-1.5-.2-1.85-.34a3.1 3.1 0 0 1-1.14-.75 3.1 3.1 0 0 1-.75-1.14c-.14-.35-.3-.88-.34-1.85C3.81 14.96 3.8 14.65 3.8 12s.01-2.96.06-4.01c.04-.97.2-1.5.34-1.85.18-.46.4-.79.75-1.14.35-.35.68-.57 1.14-.75.35-.14.88-.3 1.85-.34C9.04 3.81 9.35 3.8 12 3.8Zm0 3.05a5.15 5.15 0 1 0 0 10.3 5.15 5.15 0 0 0 0-10.3Zm0 8.5a3.35 3.35 0 1 1 0-6.7 3.35 3.35 0 0 1 0 6.7Zm5.35-8.7a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/eltri-putra-rombebua-599228430?utm_source=share_via&utm_content=profile&utm_medium=member_android" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.83v1.64h.05c.53-1 1.84-2.05 3.78-2.05 4.05 0 4.8 2.67 4.8 6.14V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z"/></svg>
            </a>
            <a href="https://x.com/eltriputraa" aria-label="Twitter">
              <svg viewBox="0 0 24 24"><path d="M18.9 2H22l-7.3 8.34L23 22h-6.8l-5.3-6.9L4.8 22H1.7l7.8-8.92L1 2h6.9l4.8 6.36L18.9 2Zm-1.2 18h1.9L7.4 4h-2L17.7 20Z"/></svg>
            </a>
          </div>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span style={menuOpen ? { transform: 'translateY(7px) rotate(45deg)' } : undefined}></span>
            <span style={menuOpen ? { opacity: 0 } : undefined}></span>
            <span style={menuOpen ? { transform: 'translateY(-7px) rotate(-45deg)' } : undefined}></span>
          </button>
        </div>

        <nav>
          <img src="/images/logo/rest.png" alt="Logo ELTRI" className="nav-logo" />
          <div className="nav-links">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <div className={`mobile-sidebar${menuOpen ? ' is-open' : ''}`}>
        <img src="/images/logo/rest.png" alt="Logo ELTRI" className="mobile-sidebar-logo" />
        <nav className="mobile-sidebar-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div
        className={`sidebar-overlay${menuOpen ? ' is-open' : ''}`}
        onClick={closeMenu}
      ></div>
    </>
  );
}
