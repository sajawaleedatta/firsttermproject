import { Link, Navigate } from "react-router-dom";
import { useMyOrders } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading, isError, error, refetch } = useMyOrders();

  if (authLoading) return <Spinner size="lg" text="Loading..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (isLoading) return <Spinner size="lg" text="Loading orders..." />;
  if (isError) return <ErrorMessage message={error instanceof Error ? error.message : "Failed to load orders"} onRetry={refetch} />;

  const orders = data?.data ?? [];

  if (orders.length === 0) {
    return (
      <div className="empty">
        <h2>No orders yet</h2>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h2>My Orders</h2>
      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <div className="order-card-header">
            <div>
              <p className="order-card-id">Order #{order.id.slice(0, 8)}</p>
              <p className="order-card-date">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="order-card-badges">
              <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
              <span className={`badge badge-payment badge-${order.paymentStatus.toLowerCase()}`}>{order.paymentMethod === "CASH" ? "Cash" : "Card"}</span>
            </div>
          </div>
          <div className="order-card-items">
            {order.items.slice(0, 3).map((item) => (
              <div key={item.id} className="order-card-item">
                <div className="order-card-item-img">
                  {item.product.images[0] ? (
                    <img src={item.product.images[0].startsWith("http") ? item.product.images[0] : `http://localhost:5000${item.product.images[0]}`} alt={item.product.name} />
                  ) : (
                    <div className="product-card-placeholder">N/A</div>
                  )}
                </div>
                <span>{item.product.name} × {item.quantity}</span>
              </div>
            ))}
            {order.items.length > 3 && <p className="order-card-more">+{order.items.length - 3} more items</p>}
          </div>
          <div className="order-card-footer">
            <strong>Total: ${order.total.toFixed(2)}</strong>
            <Link to={`/orders/${order.id}`} className="btn btn-secondary btn-sm">View Details</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
