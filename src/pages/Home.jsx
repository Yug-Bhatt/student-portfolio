import { Link } from "react-router-dom";
import About from "../components/About";
import Education from "../components/Education";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Certificates from "../components/Certificates";

function Home() {
  return (
    <div className="home-page">
      {/* Premium Futuristic AI Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="ping-dot" aria-hidden="true"></span>
            AI / ML ENGINEER
          </div>

          <h1 className="hero-title">
            Building Intelligent Solutions with <span className="gradient-text">AI &amp; Machine Learning</span>
          </h1>

          <p className="hero-description">
            Hi, I&apos;m <strong>Yug Bhatt</strong> — a B.Tech Artificial Intelligence &amp; Machine Learning scholar at CHARUSAT University. I develop end-to-end predictive models, neural architectures, data intelligence pipelines, and production-ready full-stack applications.
          </p>

          <div className="hero-meta-strip">
            <span className="meta-chip">
              🎓 <strong>CHARUSAT University</strong>
            </span>
            <span className="meta-chip">
              ⚡ <strong>Batch 2024–2028</strong>
            </span>
            <span className="meta-chip">
              🆔 <strong>24AIML003</strong>
            </span>
            <span className="meta-chip">
              📊 <strong>CGPA: 7.12</strong>
            </span>
          </div>

          <div className="hero-cta-group">
            <Link to="/projects" className="btn btn-primary">
              View Projects →
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              Contact Me
            </Link>
            <Link to="/tasks" className="btn btn-outline">
              Tasks API Demo
            </Link>
          </div>
        </div>

        {/* Pure CSS Futuristic AI Orbital Core Graphic */}
        <div className="hero-visual" aria-hidden="true">
          <div className="ai-core-container">
            <div className="ai-orbit orbit-1"></div>
            <div className="ai-orbit orbit-2"></div>

            <div className="ai-core-orb">
              <span>🧠</span>
              <small>Neural AI</small>
            </div>

            <div className="floating-chip chip-1">
              <span style={{ color: "var(--cyan-bright)" }}>●</span>
              <span>Model Accuracy: 98.4%</span>
            </div>

            <div className="floating-chip chip-2">
              <span style={{ color: "var(--purple-glow)" }}>●</span>
              <span>Python &bull; Scikit-Learn</span>
            </div>

            <div className="floating-chip chip-3">
              <span style={{ color: "var(--success)" }}>●</span>
              <span>React &bull; MongoDB CRUD</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="stats-grid" aria-label="Portfolio Metrics">
        <div className="stat-metric-card">
          <div className="stat-icon">🚀</div>
          <div className="stat-value">3+</div>
          <div className="stat-label">AI / ML Projects</div>
          <div className="stat-desc">Financial risk, churn prediction &amp; generative AI</div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-icon">📜</div>
          <div className="stat-value">4+</div>
          <div className="stat-label">Certifications</div>
          <div className="stat-desc">NVIDIA, Google AI, Google Cloud &amp; DeepLearning.AI</div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">10+</div>
          <div className="stat-label">Core Technologies</div>
          <div className="stat-desc">Python, ML, Scikit, React, Express &amp; MongoDB</div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-value">7.12</div>
          <div className="stat-label">Academic CGPA</div>
          <div className="stat-desc">B.Tech Artificial Intelligence &amp; Data Science</div>
        </div>
      </section>

      {/* Featured Sections */}
      <About />
      <Education />
      <Skills />
      <Projects />
      <Certificates />
    </div>
  );
}

export default Home;