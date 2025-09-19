import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { LayoutGrid, Trophy, Bot, LogOut } from "lucide-react";
import "./NavBar.css";
import { AuthContext } from "../../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : "?";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Logo - Now a direct child */}
        <Link to="/dashboard" className="navbar-logo">
          <LayoutGrid size={28} color="var(--clr-rose)" />
          <span className="logo-text">CubeDash</span>
        </Link>

        {/* Navigation Links - Now a direct child, positioned in the center */}
        <nav className="navbar-nav-wrapper">
          <ul className="navbar-nav">
            <li>
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `navbar-link ${isActive ? "active-indigo" : ""}`
                }
              >
                <Trophy size={16} /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/solver"
                className={({ isActive }) =>
                  `navbar-link ${isActive ? "active-rose" : ""}`
                }
              >
                <Bot size={16} /> Solver
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* User Dropdown Section - Remains on the right */}
        <div className="navbar-user" ref={dropdownRef}>
          <button
            className="navbar-avatar-btn"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <img
              src={`https://placehold.co/40x40/4f46e5/f1f5f9?text=${userInitial}`}
              alt="Player Avatar"
              className="navbar-avatar"
            />
          </button>

          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="user-info">
                <span>Signed in as</span>
                <strong>{user?.username}</strong>
              </div>
              <button className="dropdown-item" onClick={handleLogout}>
                <LogOut size={16} /> 
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;