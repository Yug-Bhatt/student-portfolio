function Projects() {
  const featured = [
    {
      title: "AEGIS-FIN - Financial Risk Intelligence Platform",
      category: "AI & Fintech",
      description:
        "Comprehensive machine learning system for real-time credit default risk assessment, financial anomaly detection, and automated credit scoring.",
      tags: ["Python", "Machine Learning", "Scikit-Learn", "Financial Risk"],
      githubUrl: "https://github.com/Yug-Bhatt",
    },
    {
      title: "Customer Churn Prediction using Machine Learning",
      category: "Data Science",
      description:
        "End-to-end churn classification pipeline using ensemble models, customer behavior analytics, feature importance evaluation, and ROC-AUC optimization.",
      tags: ["Python", "Pandas", "Scikit-Learn", "Ensemble Methods"],
      githubUrl: "https://github.com/Yug-Bhatt",
    },
    {
      title: "Multi-Persona AI Storyteller",
      category: "Generative AI",
      description:
        "Interactive narrative generation engine powered by multi-persona contextual prompt engineering, dynamic storytelling branching, and response synthesis.",
      tags: ["Python", "GenAI", "NLP", "Prompt Engineering"],
      githubUrl: "https://github.com/Yug-Bhatt",
    },
  ];

  return (
    <section className="card" id="featured-projects">
      <div className="section-header">
        <span className="section-tag">Key Works</span>
        <h2 className="section-title">Featured Projects</h2>
      </div>

      <div className="projects-grid">
        {featured.map((proj, idx) => (
          <div key={idx} className="project-card">
            <div>
              <div className="project-card-header">
                <h3>{proj.title}</h3>
                <span className="project-category-tag">{proj.category}</span>
              </div>
              <p className="project-card-desc" style={{ marginTop: "12px" }}>
                {proj.description}
              </p>
            </div>

            <div>
              <div className="project-tags">
                {proj.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="project-tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="project-footer">
                <a
                  href={proj.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="project-link-btn"
                >
                  View Code Repository ↗
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;