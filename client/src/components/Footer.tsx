import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h4>Deci Techno</h4>
          <p>Your premium destination for laptops, tablets, mobile phones, and smart watches.</p>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/products?category=Laptops">Laptops</Link>
          <Link to="/products?category=Tablets">Tablets</Link>
          <Link to="/products?category=Mobile">Mobile</Link>
          <Link to="/products?category=Smart+Watches">Smart Watches</Link>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/orders">My Orders</Link>
          <Link to="/cart">Cart</Link>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <span>contact@ecommence.com</span>
          <span>1-800-555-0199</span>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Deci Techno. All rights reserved.</p>
      </div>
    </footer>
  );
}
