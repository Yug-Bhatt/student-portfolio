import { useState } from "react";
import Contact from "../components/Contact";

function ContactPage() {
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formMsg, setFormMsg] = useState("");
  const [sentFeedback, setSentFeedback] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formMsg.trim()) {
      alert("Please fill in your name, email, and message.");
      return;
    }

    const mailtoUrl = `mailto:yugbhatt75@gmail.com?subject=${encodeURIComponent(
      formSubject || `Message from ${formName}`
    )}&body=${encodeURIComponent(
      `From: ${formName} (${formEmail})\n\nMessage:\n${formMsg}`
    )}`;

    window.location.href = mailtoUrl;
    setSentFeedback("Opening your default mail client with your drafted message...");
    setTimeout(() => setSentFeedback(""), 4000);
  };

  return (
    <div className="contact-page">
      <div className="section-header" style={{ marginBottom: "32px", textAlign: "center" }}>
        <span className="section-tag">Direct Communication</span>
        <h1 className="section-title">Get In Touch</h1>
        <p className="section-subtitle" style={{ maxWidth: "600px", margin: "8px auto 0" }}>
          Have a question, project proposal, or AI/ML research idea? Feel free to reach out directly.
        </p>
      </div>

      <Contact />

      {/* Quick Direct Note Form */}
      <section className="card" style={{ marginTop: "28px" }}>
        <div className="section-header">
          <span className="section-tag">Direct Inquiry</span>
          <h2 className="section-title">Send a Quick Note</h2>
          <p className="section-subtitle">
            Draft your note and dispatch it directly to <strong>yugbhatt75@gmail.com</strong>.
          </p>
        </div>

        {sentFeedback && <div className="success-message">✓ {sentFeedback}</div>}

        <form onSubmit={handleSendMessage} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Patel / Recruiter"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-main)",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                Your Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. recruiter@company.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-main)",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Subject
            </label>
            <input
              type="text"
              placeholder="e.g. AI/ML Engineering Opportunity / Project Discussion"
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-main)",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Message
            </label>
            <textarea
              rows="4"
              placeholder="Write your message here..."
              value={formMsg}
              onChange={(e) => setFormMsg(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-main)",
                fontFamily: "inherit",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "fit-content", padding: "12px 28px" }}
          >
            Send Message via Email ↗
          </button>
        </form>
      </section>
    </div>
  );
}

export default ContactPage;