import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={isAdmin ? "/admin" : "/"} className="navbar-brand">Deci Techno</Link>
        <div className="navbar-links">
          {isAdmin ? (
            <Link to="/admin">Dashboard</Link>
          ) : (
            <>
              <Link to="/">Home</Link>
              <Link to="/products">Products</Link>
              <Link to="/cart">Cart</Link>
              <Link to="/orders">Orders</Link>
            </>
          )}
          {user ? (
            <>
              <span className="navbar-user">Hi, {user.name || user.email}</span>
              <Link to="/profile">Profile</Link>
              <button onClick={handleLogout} className="btn-link">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
