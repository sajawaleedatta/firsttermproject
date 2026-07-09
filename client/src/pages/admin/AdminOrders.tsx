import { useAdminOrders, useUpdateOrderStatus } from "../../hooks/useApi";
import Spinner from "../../components/Spinner";
import ErrorMessage from "../../components/ErrorMessage";

export default function AdminOrders() {
  const { data, isLoading, isError, error, refetch } = useAdminOrders();
  const updateMutation = useUpdateOrderStatus();

  if (isLoading) return <Spinner size="lg" text="Loading orders..." />;
  if (isError) return <ErrorMessage message={error instanceof Error ? error.message : "Failed to load orders"} onRetry={refetch} />;

  const orders = data?.data ?? [];

  const handleStatus = (id: string, status: string) => {
    updateMutation.mutate({ id, data: { status } });
  };

  const handlePayment = (id: string, paymentStatus: string) => {
    updateMutation.mutate({ id, data: { paymentStatus } });
  };

  return (
    <div>
      <h2>Manage Orders</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={8} className="empty-cell">No orders found.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id-cell">#{order.id.slice(0, 8)}</td>
                  <td>{order.user?.email || order.userId.slice(0, 8)}</td>
                  <td>{order.items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>
                    <span className={`badge badge-${order.paymentStatus.toLowerCase()}`}>
                      {order.paymentMethod} / {order.paymentStatus}
                    </span>
                  </td>
                  <td><span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span></td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-order-actions">
                      {order.status === "PENDING" && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleStatus(order.id, "CONFIRMED")} disabled={updateMutation.isPending}>
                          Confirm
                        </button>
                      )}
                      {order.status === "CONFIRMED" && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleStatus(order.id, "SHIPPED")} disabled={updateMutation.isPending}>
                          Ship
                        </button>
                      )}
                      {order.status === "SHIPPED" && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleStatus(order.id, "DELIVERED")} disabled={updateMutation.isPending}>
                          Deliver
                        </button>
                      )}
                      {order.paymentStatus === "PENDING" && (
                        <button className="btn btn-sm btn-secondary" onClick={() => handlePayment(order.id, "PAID")} disabled={updateMutation.isPending}>
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
