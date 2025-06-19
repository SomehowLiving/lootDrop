// components/Navbar.jsx
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand fw-bold text-light" to="/">
        🪙 lootDrop
      </Link>

      <div className="collapse navbar-collapse justify-content-end">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="nav-link" to="/">🏠 Home</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/create">🧙 Create</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/about">📖 About</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/features">🌟 Features</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
