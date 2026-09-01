import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, getStoredUser, logout } from "../api";

function Header(props) {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(isAuthenticated());
  const [user, setUser] = useState(getStoredUser());

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
    navigate("/login");
  };

  return (
    <header className="header">
      <h1>{props.name}</h1>
      <p>{props.course}</p>

      {/* Authenticated User Status Indicator */}
      {auth && (
        <div className="auth-indicator-badge">
          <span>🔐 Authenticated</span>
          {user && (
            <span className="auth-user-info">
              {user.name} ({user.rollNo || "24AIML003"})
            </span>
          )}
        </div>
      )}

      <nav style={{ marginTop: "15px" }}>
        <Link to="/" style={linkStyle}>
          Home
        </Link>

        <Link to="/about" style={linkStyle}>
          About
        </Link>

        <Link to="/projects" style={linkStyle}>
          Projects
        </Link>

        <Link to="/tasks" style={linkStyle}>
          Tasks API
        </Link>

        <Link to="/contact" style={linkStyle}>
          Contact
        </Link>

        {auth ? (
          <button onClick={handleLogout} className="header-logout-btn">
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>
              Login
            </Link>
            <Link to="/register" style={linkStyle}>
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  margin: "0 10px",
  fontWeight: "bold",
};

export default Header;