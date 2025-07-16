import { Link } from "react-router-dom";

const Header = () => {

  return (
    <header
      style={{
        padding: "1rem",
        backgroundColor: "#1e1e1e",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Link to="/" style={{ color: "#bb86fc", textDecoration: "none" }}>
        Home
      </Link>
      <Link to="/register" style={{ color: "#bb86fc", textDecoration: "none" }}>
        Register
      </Link>
    </header>
  );
};

export default Header;
