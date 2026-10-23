function About() {
  return (
    <section className="card" id="about">
      <div className="section-header">
        <span className="section-tag">Profile Overview</span>
        <h2 className="section-title">About Me</h2>
      </div>

      <p style={{ fontSize: "16px", color: "var(--text-secondary)", lineHeight: "1.75", marginBottom: "24px" }}>
        I am <strong>Yug Bhatt</strong>, an Artificial Intelligence &amp; Machine Learning undergraduate at <strong>CHARUSAT University</strong> (2024–2028, Roll No: 24AIML003). I am passionate about bridging theoretical machine learning algorithms with practical, production-ready full-stack software solutions.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" }}>
        <div style={{ background: "var(--bg-secondary)", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>🧠</div>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
            AI &amp; Machine Learning
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
            Focusing on classification models, predictive analysis, regression, and neural architectures with Python, Scikit-Learn, and Pandas.
          </p>
        </div>

        <div style={{ background: "var(--bg-secondary)", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>💻</div>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
            Full-Stack Engineering
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
            Building responsive client applications with React &amp; Vite, coupled with robust Node.js, Express, and MongoDB backends with JWT authentication.
          </p>
        </div>

        <div style={{ background: "var(--bg-secondary)", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>📊</div>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
            Data Science &amp; Pipelines
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
            Exploratory data analysis, feature engineering, data cleaning, and performance optimization for data-driven systems.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;