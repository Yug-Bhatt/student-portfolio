function Skills() {
  const skillCategories = [
    {
      category: "Programming Languages",
      skills: ["Python", "Java", "JavaScript", "SQL"],
    },
    {
      category: "AI & Machine Learning",
      skills: ["Machine Learning", "Scikit-Learn", "Pandas", "NumPy", "Neural Networks"],
    },
    {
      category: "Web & Full-Stack",
      skills: ["React", "Node.js", "Express", "MongoDB", "RESTful APIs"],
    },
    {
      category: "Tools & Cloud Platforms",
      skills: ["Git", "GitHub", "Google Cloud", "Vite", "JWT Authentication"],
    },
  ];

  return (
    <section className="card" id="skills">
      <div className="section-header">
        <span className="section-tag">Technical Competencies</span>
        <h2 className="section-title">Skills &amp; Technologies</h2>
      </div>

      <div className="skills-container">
        {skillCategories.map((group, idx) => (
          <div key={idx} className="skill-category">
            <h3>{group.category}</h3>
            <div className="skill-chips">
              {group.skills.map((skill, sIdx) => (
                <span key={sIdx} className="skill-chip">
                  <span style={{ color: "var(--cyan-bright)" }}>⚡</span>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;