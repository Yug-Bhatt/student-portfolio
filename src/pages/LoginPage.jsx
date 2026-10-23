import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../api";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please provide both email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      // Store JWT token safely
      localStorage.setItem("token", data.token);

      // Store minimal safe user info (no passwords)
      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            rollNo: data.user.rollNo,
          })
        );
      }

      // Notify header and app components of auth change
      window.dispatchEvent(new Event("authChange"));

      // Navigate to /tasks or redirect from previous location
      const from = location.state?.from?.pathname || "/tasks";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div
            className="brand-badge"
            style={{ width: "48px", height: "48px", margin: "0 auto 12px", fontSize: "18px" }}
          >
            YB
          </div>
          <h2>Student Portal Login</h2>
          <p className="auth-subtitle">
            Authenticate to access the protected Tasks API and database workspace
          </p>
        </div>

        {error && <div className="error-message">⚠ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Academic / Student Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="e.g. 24aiml003@charusat.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="login-password">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--cyan-bright)",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Authenticating with JWT..." : "Sign In to Account →"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don&apos;t have an account yet?{" "}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
