import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { isAuthenticated, getStoredUser, logout } from "../api";

function Header(props) {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(isAuthenticated());
  const [user, setUser] = useState(getStoredUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleAuthUpdate = () => {
      setAuth(isAuthenticated());
      setUser(getStoredUser());
    };

    window.addEventListener("authChange", handleAuthUpdate);
    window.addEventListener("storage", handleAuthUpdate);

    return () => {
      window.removeEventListener("authChange", handleAuthUpdate);
      window.removeEventListener("storage", handleAuthUpdate);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="header">
      {/* Brand Monogram & Meta */}
      <div className="header-brand">
        <div className="brand-badge" aria-hidden="true">
          YB
        </div>
        <div className="brand-meta">
          <h1>{props.name || "Yug Bhatt"}</h1>
          <p>{props.course || "B.Tech Artificial Intelligence & Machine Learning"}</p>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="header-nav" aria-label="Main Navigation">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} end>
          Home
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          About
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          Projects
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          Tasks API
        </NavLink>
        <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          Contact
        </NavLink>
      </nav>

      {/* Header Actions (Auth, Dark Mode, Mobile Toggle) */}
      <div className="header-actions">
        {/* Auth status indicator */}
        {auth && (
          <div className="auth-indicator-badge">
            <span role="img" aria-label="lock">🔐</span>
            <span>Auth</span>
            {user && (
              <span className="auth-user-info">
                ({user.name?.split(" ")[0] || "User"})
              </span>
            )}
          </div>
        )}

        {/* Auth / Logout Link */}
        {auth ? (
          <button onClick={handleLogout} className="header-logout-btn" aria-label="Logout">
            Logout
          </button>
        ) : (
          <div className="auth-nav-links" style={{ display: "inline-flex", gap: "6px" }}>
            <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Login
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Register
            </NavLink>
          </div>
        )}

        {/* Dark Mode Toggle Button */}
        {props.onToggleDarkMode && (
          <button
            className="dark-mode-btn"
            onClick={props.onToggleDarkMode}
            aria-label="Toggle dark/light mode"
          >
            {props.darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        )}

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <NavLink to="/" onClick={closeMobile} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} end>
            Home
          </NavLink>
          <NavLink to="/about" onClick={closeMobile} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            About
          </NavLink>
          <NavLink to="/projects" onClick={closeMobile} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Projects
          </NavLink>
          <NavLink to="/tasks" onClick={closeMobile} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Tasks API
          </NavLink>
          <NavLink to="/contact" onClick={closeMobile} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Contact
          </NavLink>
          {!auth ? (
            <>
              <NavLink to="/login" onClick={closeMobile} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Login
              </NavLink>
              <NavLink to="/register" onClick={closeMobile} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Register
              </NavLink>
            </>
          ) : (
            <button onClick={handleLogout} className="header-logout-btn" style={{ width: "100%", marginTop: "8px" }}>
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;