function Education() {
  return (
    <section className="card" id="education">
      <div className="section-header">
        <span className="section-tag">Academic Background</span>
        <h2 className="section-title">Education</h2>
      </div>

      <div className="education-item">
        <div className="education-icon" aria-hidden="true">
          🎓
        </div>
        <div className="education-details">
          <h3>B.Tech in Artificial Intelligence &amp; Machine Learning</h3>
          <p style={{ fontWeight: "600", color: "var(--text-main)", marginTop: "2px" }}>
            CHARUSAT University (Charotar University of Science and Technology)
          </p>
          <p>
            Duration: <strong>2024 – 2028</strong> • Roll No: <strong>24AIML003</strong>
          </p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "10px", flexWrap: "wrap" }}>
            <span className="education-badge">
              Current CGPA: 7.12
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Specialization: Artificial Intelligence &amp; Machine Learning
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Education;