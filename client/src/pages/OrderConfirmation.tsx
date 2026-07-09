import { useParams, Link } from "react-router-dom";
import { useOrder } from "../hooks/useApi";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = useOrder(id!);

  if (isLoading) return <Spinner size="lg" text="Loading order..." />;
  if (isError) return <ErrorMessage message={error instanceof Error ? error.message : "Failed to load order"} onRetry={refetch} />;

  const order = data?.data;
  if (!order) return <div className="empty">Order not found.</div>;

  return (
    <div className="order-confirmation">
      <div className="order-confirmation-header">
        <h2>Order Confirmed!</h2>
        <p>Thank you for your purchase. Your order has been placed successfully.</p>
      </div>

      <div className="order-details-card">
        <div className="order-details-row">
          <span>Order ID</span>
          <span>{order.id}</span>
        </div>
        <div className="order-details-row">
          <span>Status</span>
          <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
        </div>
        <div className="order-details-row">
          <span>Payment</span>
          <span>{order.paymentMethod === "CASH" ? "Cash on Delivery" : "Card Payment"}</span>
        </div>
        <div className="order-details-row">
          <span>Payment Status</span>
          <span className={`badge badge-${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span>
        </div>
        <div className="order-details-row">
          <span>Date</span>
          <span>{new Date(order.createdAt).toLocaleString()}</span>
        </div>
        <div className="order-details-row order-total-row">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>

      <h3>Items</h3>
      <div className="order-items">
        {order.items.map((item) => (
          <div key={item.id} className="order-item">
            <div className="order-item-img">
              {item.product.images[0] ? (
                <img src={item.product.images[0].startsWith("http") ? item.product.images[0] : `http://localhost:5000${item.product.images[0]}`} alt={item.product.name} />
              ) : (
                <div className="product-card-placeholder">No Image</div>
              )}
            </div>
            <div className="order-item-info">
              <Link to={`/products/${item.productId}`}>{item.product.name}</Link>
              <p>Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
            </div>
            <p className="order-item-total">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="order-confirmation-actions">
        <Link to="/orders" className="btn btn-secondary">View All Orders</Link>
        <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}
