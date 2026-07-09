import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useApi";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

const CATEGORIES = [
  { name: "Laptops", icon: "💻" },
  { name: "Tablets", icon: "📱" },
  { name: "Mobile", icon: "📞" },
  { name: "Smart Watches", icon: "⌚" },
];

export default function Home() {
  const { data, isLoading, isError, error, refetch } = useProducts({ sortBy: "createdAt", sortOrder: "desc", limit: 8 });

  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Deci Techno</h1>
          <p>Discover premium laptops, tablets, mobile phones, and smart watches at unbeatable prices.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
            <Link to="/register" className="btn btn-secondary">Get Started</Link>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <Link key={cat.name} to={`/products?category=${cat.name}`} className="category-card">
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bestsellers-section">
        <div className="bestsellers-header">
          <h2>Latest Products</h2>
          <Link to="/products" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        {isLoading ? (
          <Spinner size="md" text="Loading products..." />
        ) : isError ? (
          <ErrorMessage message={error instanceof Error ? error.message : "Failed to load"} onRetry={refetch} />
        ) : (
          <div className="product-grid">
            {(data?.data ?? []).map((p) => (
              <Link to={`/products/${p.id}`} key={p.id} className="product-card">
                <div className="product-card-img">
                  {p.images[0] ? <img src={p.images[0].startsWith("http") ? p.images[0] : `http://localhost:5000${p.images[0]}`} alt={p.name} /> : <div className="product-card-placeholder">No Image</div>}
                </div>
                <div className="product-card-body">
                  <h4>{p.name}</h4>
                  {p.category && <span className="product-category">{p.category}</span>}
                  <p className="product-price">${p.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
