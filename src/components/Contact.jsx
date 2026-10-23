import { useState } from "react";

function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText("yugbhatt75@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="card" id="contact">
      <div className="section-header">
        <span className="section-tag">Let's Connect</span>
        <h2 className="section-title">Contact Information</h2>
        <p className="section-subtitle">
          Open to AI/ML research collaborations, internships, and engineering opportunities.
        </p>
      </div>

      <div className="contact-grid">
        {/* Email */}
        <div className="contact-card-item">
          <div className="contact-icon-box" aria-hidden="true">
            ✉️
          </div>
          <div className="contact-info" style={{ width: "100%" }}>
            <h4>Email Address</h4>
            <p>
              <a href="mailto:yugbhatt75@gmail.com" style={{ color: "var(--cyan-bright)" }}>
                yugbhatt75@gmail.com
              </a>
            </p>
            <button
              onClick={copyEmail}
              style={{
                marginTop: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                color: copied ? "var(--success)" : "var(--text-secondary)",
                fontWeight: "600",
              }}
            >
              {copied ? "✓ Email Copied!" : "📋 Copy Email"}
            </button>
          </div>
        </div>

        {/* Phone */}
        <div className="contact-card-item">
          <div className="contact-icon-box" aria-hidden="true">
            📞
          </div>
          <div className="contact-info">
            <h4>Phone Number</h4>
            <p>
              <a href="tel:+917600634214" style={{ color: "var(--text-main)" }}>
                +91 7600634214
              </a>
            </p>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Available for professional calls
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="contact-card-item">
          <div className="contact-icon-box" aria-hidden="true">
            📍
          </div>
          <div className="contact-info">
            <h4>Location &amp; Campus</h4>
            <p>Nadiad, Gujarat, India</p>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              CHARUSAT University Campus
            </span>
          </div>
        </div>

        {/* GitHub */}
        <div className="contact-card-item">
          <div className="contact-icon-box" aria-hidden="true">
            🐙
          </div>
          <div className="contact-info">
            <h4>GitHub Profile</h4>
            <p>
              <a
                href="https://github.com/Yug-Bhatt"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--cyan-bright)" }}
              >
                github.com/Yug-Bhatt
              </a>
            </p>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Explore source repositories
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;