function Certificates() {
  const certs = [
    {
      title: "NVIDIA AI Certificate",
      issuer: "NVIDIA Deep Learning Institute",
      icon: "🟢",
    },
    {
      title: "Google AI Essentials",
      issuer: "Google Career Certificates",
      icon: "🔵",
    },
    {
      title: "Google Cloud Fundamentals",
      issuer: "Google Cloud Platform",
      icon: "☁️",
    },
    {
      title: "Neural Networks & Deep Learning",
      issuer: "DeepLearning.AI",
      icon: "🧠",
    },
  ];

  return (
    <section className="card" id="certificates">
      <div className="section-header">
        <span className="section-tag">Credentials</span>
        <h2 className="section-title">Certifications</h2>
      </div>

      <div className="cert-grid">
        {certs.map((c, i) => (
          <div key={i} className="cert-card">
            <div className="cert-badge-icon" aria-hidden="true">
              {c.icon}
            </div>
            <div>
              <div className="cert-title">{c.title}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                {c.issuer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Certificates;