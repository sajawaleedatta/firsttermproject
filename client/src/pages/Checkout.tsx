import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart, useCreateOrder } from "../hooks/useApi";
import Spinner from "../components/Spinner";

export default function Checkout() {
  const navigate = useNavigate();
  const { data, isLoading: cartLoading } = useCart();
  const createOrder = useCreateOrder();
  const [method, setMethod] = useState<"CASH" | "VISA">("CASH");
  const [cardInfo, setCardInfo] = useState({ number: "", expiry: "", cvv: "", name: "" });

  const cart = data?.data;
  if (cartLoading) return <Spinner size="lg" text="Loading cart..." />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="empty">
        <h2>Your cart is empty</h2>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    if (method === "VISA") {
      if (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvv || !cardInfo.name) return;
    }
    createOrder.mutate(method, {
      onSuccess: (res) => navigate(`/orders/${res.data.id}`),
    });
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <div className="checkout-layout">
        <div className="checkout-items">
          <h3>Order Summary</h3>
          {cart.items.map((item) => (
            <div key={item.id} className="checkout-item">
              <div className="checkout-item-img">
                {item.product.images[0] ? (
                  <img src={item.product.images[0].startsWith("http") ? item.product.images[0] : `http://localhost:5000${item.product.images[0]}`} alt={item.product.name} />
                ) : (
                  <div className="product-card-placeholder">No Image</div>
                )}
              </div>
              <div className="checkout-item-info">
                <p className="checkout-item-name">{item.product.name}</p>
                <p className="checkout-item-qty">Qty: {item.quantity}</p>
              </div>
              <p className="checkout-item-price">${(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="checkout-total">
            <strong>Total: ${cart.total.toFixed(2)}</strong>
          </div>
        </div>

        <div className="checkout-payment">
          <h3>Payment Method</h3>

          <div className="payment-options">
            <label className={`payment-option ${method === "CASH" ? "selected" : ""}`}>
              <input type="radio" name="payment" checked={method === "CASH"} onChange={() => setMethod("CASH")} />
              <span className="payment-option-label">Cash on Delivery</span>
              <span className="payment-option-desc">Pay when you receive your order</span>
            </label>

            <label className={`payment-option ${method === "VISA" ? "selected" : ""}`}>
              <input type="radio" name="payment" checked={method === "VISA"} onChange={() => setMethod("VISA")} />
              <span className="payment-option-label">Credit / Debit Card</span>
              <span className="payment-option-desc">Pay securely with your card</span>
            </label>
          </div>

          {method === "VISA" && (
            <div className="card-form">
              <div className="form-group">
                <label>Cardholder Name</label>
                <input type="text" value={cardInfo.name} onChange={(e) => setCardInfo((c) => ({ ...c, name: e.target.value }))} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Card Number</label>
                <input type="text" value={cardInfo.number} onChange={(e) => setCardInfo((c) => ({ ...c, number: e.target.value }))} placeholder="1234 5678 9012 3456" maxLength={19} />
              </div>
              <div className="card-row">
                <div className="form-group">
                  <label>Expiry</label>
                  <input type="text" value={cardInfo.expiry} onChange={(e) => setCardInfo((c) => ({ ...c, expiry: e.target.value }))} placeholder="MM/YY" maxLength={5} />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input type="text" value={cardInfo.cvv} onChange={(e) => setCardInfo((c) => ({ ...c, cvv: e.target.value }))} placeholder="123" maxLength={4} />
                </div>
              </div>
            </div>
          )}

          <button className="btn btn-primary checkout-btn" onClick={handlePlaceOrder} disabled={createOrder.isPending}>
            {createOrder.isPending ? "Processing..." : `Place Order - $${cart.total.toFixed(2)}`}
          </button>

          {createOrder.isError && (
            <p className="form-error">{createOrder.error instanceof Error ? createOrder.error.message : "Failed to place order."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
