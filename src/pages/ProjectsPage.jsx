import { useEffect, useState } from "react";

import Loading from "../components/Loading";
import Error from "../components/Error";

function ProjectsPage() {

  const [repos, setRepos] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  useEffect(() => {

    fetch("https://api.github.com/users/Yug-Bhat/repos")

      .then((response) => {

        if (!response.ok) {
          throw new Error("API Error");
        }

        return response.json();

      })

      .then((data) => {

        setRepos(data);

        setLoading(false);

      })

      .catch(() => {

        setError(true);

        setLoading(false);

      });

  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  return (

    <div className="card">

      <h2>GitHub Projects</h2>

      {repos.map((repo) => (

        <div key={repo.id} style={{ marginBottom: "20px" }}>

          <h3>{repo.name}</h3>

          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
          >
            {repo.html_url}
          </a>

          <hr />

        </div>

      ))}

    </div>

  );

}

export default ProjectsPage;