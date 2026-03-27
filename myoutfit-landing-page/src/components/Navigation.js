import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();
  const pathname = router.pathname;
  const isB2BPage = pathname?.startsWith('/b2b') || pathname === '/dashboard';

  return (
    <nav className="navbar bg-primary navbar-expand-lg">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/">
          <span style={{ color: 'white', fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.01em' }}>MyOutfit</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ border: '1px solid white', color: 'white' }}
        >
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link
                className={`nav-link text-white ${pathname === '/' ? 'active' : ''}`}
                href="/"
              >
                Inicio
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a
                className={`nav-link dropdown-toggle text-white ${isB2BPage ? 'active' : ''}`}
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Para Tiendas
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" href="/b2b">
                    MyOutfit for Business
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/b2b/demo">
                    Demo
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/b2b/pricing">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/b2b/docs">
                    Documentación
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link className="dropdown-item" href="/dashboard">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

