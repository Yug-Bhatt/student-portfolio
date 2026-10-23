import About from "../components/About";
import Education from "../components/Education";
import Skills from "../components/Skills";
import Certificates from "../components/Certificates";

function AboutPage() {
  return (
    <div className="about-page">
      <div className="section-header" style={{ marginBottom: "32px", textAlign: "center" }}>
        <span className="section-tag">AI/ML Engineer Profile</span>
        <h1 className="section-title">About Yug Bhatt</h1>
        <p className="section-subtitle" style={{ maxWidth: "600px", margin: "8px auto 0" }}>
          Undergraduate in Artificial Intelligence &amp; Machine Learning at CHARUSAT University passionate about cutting-edge computational intelligence.
        </p>
      </div>

      <About />
      <Education />
      <Skills />
      <Certificates />

      {/* Engineering Philosophy Card */}
      <section className="card">
        <div className="section-header">
          <span className="section-tag">Methodology</span>
          <h2 className="section-title">Engineering Philosophy</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          <div style={{ background: "var(--bg-secondary)", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: "16px", color: "var(--cyan-bright)", marginBottom: "8px" }}>
              🎯 Data-Centric AI
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
              Prioritizing high-quality feature engineering, rigorous data cleaning, and statistical validation over opaque black-box heuristics.
            </p>
          </div>
          <div style={{ background: "var(--bg-secondary)", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: "16px", color: "var(--cyan-bright)", marginBottom: "8px" }}>
              ⚡ High-Performance Web
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
              Implementing modern code splitting, React.lazy() code optimization, asynchronous APIs, and responsive mobile-first interfaces.
            </p>
          </div>
          <div style={{ background: "var(--bg-secondary)", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: "16px", color: "var(--cyan-bright)", marginBottom: "8px" }}>
              🔒 Security &amp; Scalability
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
              Designing secure JWT authorization layers, password hashing with bcrypt, sanitized inputs, and robust MongoDB schema architectures.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;