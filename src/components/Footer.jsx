import { Link } from "react-router-dom";

function Footer(props) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="brand-badge" style={{ width: "32px", height: "32px", fontSize: "13px" }}>
            YB
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
              Yug Bhatt
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              B.Tech AIML • CHARUSAT University (Roll: 24AIML003)
            </p>
          </div>
        </div>

        <nav className="footer-links" aria-label="Footer Navigation">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/tasks">Tasks API</Link>
          <Link to="/contact">Contact</Link>
          <a
            href="https://github.com/Yug-Bhatt"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Profile"
          >
            GitHub
          </a>
        </nav>
      </div>

      <div className="footer-bottom">
        <p>
          © {currentYear} Yug Bhatt. All rights reserved.
        </p>
        <p>
          Email: <a href={`mailto:${props.email || "yugbhatt75@gmail.com"}`} style={{ color: "var(--cyan-bright)" }}>
            {props.email || "yugbhatt75@gmail.com"}
          </a>
          {" • "}
          <span style={{ color: "var(--text-dim)" }}>
            React • Vite • Express • MongoDB
          </span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;