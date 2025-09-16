import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutGrid, Trophy, Bot } from 'lucide-react';
import './NavBar.css';

function Navbar() {
  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <LayoutGrid size={28} color="var(--clr-rose)" />
          <span>CubeDash</span>
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="navbar-nav">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `navbar-link ${isActive ? 'active-indigo' : ''}`
                }
              >
                <Trophy size={16} /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/solver"
                className={({ isActive }) =>
                  `navbar-link ${isActive ? 'active-rose' : ''}`
                }
              >
                <Bot size={16} /> Solver
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div className="navbar-user">
          <span>Player_One</span>
          <img
            src="https://placehold.co/40x40/4f46e5/f1f5f9?text=P1"
            alt="Player Avatar"
          />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
