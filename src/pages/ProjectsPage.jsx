import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import Error from "../components/Error";
import Projects from "../components/Projects";

function ProjectsPage() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("https://api.github.com/users/Yug-Bhatt/repos")
      .then((response) => {
        if (!response.ok) {
          throw new Error("API Error");
        }
        return response.json();
      })
      .then((data) => {
        // Sort repos by updated date descending
        const sorted = Array.isArray(data)
          ? data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          : [];
        setRepos(sorted);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const filteredRepos = repos.filter((repo) => {
    const q = searchQuery.toLowerCase();
    return (
      repo.name?.toLowerCase().includes(q) ||
      (repo.description && repo.description.toLowerCase().includes(q)) ||
      (repo.language && repo.language.toLowerCase().includes(q))
    );
  });

  return (
    <div className="projects-page">
      <div className="section-header" style={{ marginBottom: "32px", textAlign: "center" }}>
        <span className="section-tag">Engineering Showcase</span>
        <h1 className="section-title">Projects &amp; Open Source</h1>
        <p className="section-subtitle" style={{ maxWidth: "600px", margin: "8px auto 0" }}>
          Explore featured AI/ML platforms and live repositories synchronized directly from GitHub.
        </p>
      </div>

      {/* Featured AI/ML Projects */}
      <Projects />

      {/* Live GitHub Repositories Section */}
      <section className="card" style={{ marginTop: "32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div>
            <span className="section-tag">Live GitHub Sync</span>
            <h2 style={{ fontSize: "22px", margin: 0 }}>
              GitHub Repositories ({repos.length})
            </h2>
          </div>

          <input
            type="text"
            placeholder="Search repositories by name, language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "10px 16px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-main)",
              fontSize: "14px",
              minWidth: "260px",
              outline: "none",
            }}
          />
        </div>

        {loading && <Loading message="Loading Repositories..." />}

        {error && <Error />}

        {!loading && !error && filteredRepos.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
            No repositories matched &quot;{searchQuery}&quot;.
          </div>
        )}

        {!loading && !error && filteredRepos.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredRepos.map((repo) => (
              <div
                key={repo.id}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                  transition: "all var(--transition-fast)",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "var(--text-main)",
                        wordBreak: "break-all",
                      }}
                    >
                      {repo.name}
                    </h3>
                    {repo.language && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "3px 8px",
                          borderRadius: "var(--radius-full)",
                          background: "rgba(56, 189, 248, 0.12)",
                          color: "var(--cyan-bright)",
                          border: "1px solid rgba(56, 189, 248, 0.25)",
                        }}
                      >
                        {repo.language}
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      marginTop: "8px",
                      lineHeight: "1.5",
                    }}
                  >
                    {repo.description || "Public repository for student coursework and projects."}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border-subtle)",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px", color: "var(--text-dim)" }}>
                    <span>⭐ {repo.stargazers_count || 0}</span>
                    <span>🍴 {repo.forks_count || 0}</span>
                  </div>

                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "var(--cyan-bright)",
                      fontWeight: "700",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    View Code ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ProjectsPage;