import { Link, Navigate, useNavigate } from "react-router-dom";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

export default function Cart() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading, isError, error, refetch } = useCart();
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveFromCart();

  if (authLoading) return <Spinner size="lg" text="Loading..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (isLoading) return <Spinner size="lg" text="Loading cart..." />;
  if (isError) return <ErrorMessage message={error instanceof Error ? error.message : "Failed to load cart"} onRetry={refetch} />;

  const cart = data?.data;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="empty">
        <h2>Your cart is empty</h2>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Shopping Cart</h2>
      <div className="cart-items">
        {cart.items.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-img">
              {item.product.images[0] ? <img src={item.product.images[0].startsWith("http") ? item.product.images[0] : `http://localhost:5000${item.product.images[0]}`} alt={item.product.name} /> : <div className="product-card-placeholder">No Image</div>}
            </div>
            <div className="cart-item-info">
              <Link to={`/products/${item.productId}`}>{item.product.name}</Link>
              <p className="cart-item-price">${(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
            <div className="cart-item-qty">
              <button onClick={() => updateMutation.mutate({ productId: item.productId, quantity: item.quantity - 1 })} disabled={updateMutation.isPending}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateMutation.mutate({ productId: item.productId, quantity: item.quantity + 1 })} disabled={updateMutation.isPending}>+</button>
            </div>
            <button className="btn-remove" onClick={() => removeMutation.mutate(item.productId)} disabled={removeMutation.isPending}>
              {removeMutation.isPending ? "Removing..." : "Remove"}
            </button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3>Total: ${cart.total.toFixed(2)}</h3>
        <button className="btn btn-primary checkout-btn" onClick={() => navigate("/checkout")}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
