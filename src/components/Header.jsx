import { Link } from "react-router-dom";

function Header(props) {
  return (
    <header className="header">
      <h1>{props.name}</h1>
      <p>{props.course}</p>

      <nav style={{ marginTop: "15px" }}>
        <Link to="/" style={linkStyle}>
          Home
        </Link>

        <Link to="/about" style={linkStyle}>
          About
        </Link>

        <Link to="/projects" style={linkStyle}>
          Projects
        </Link>

        <Link to="/contact" style={linkStyle}>
          Contact
        </Link>
      </nav>
    </header>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  margin: "0 15px",
  fontWeight: "bold",
};

export default Header;