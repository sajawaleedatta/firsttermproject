import { Link } from "react-router-dom";
import { useAdminStats } from "../../hooks/useApi";
import Spinner from "../../components/Spinner";
import ErrorMessage from "../../components/ErrorMessage";

export default function AdminDashboard() {
  const { data, isLoading, isError, error, refetch } = useAdminStats();

  if (isLoading) return <Spinner size="lg" text="Loading dashboard..." />;
  if (isError) return <ErrorMessage message={error instanceof Error ? error.message : "Failed to load stats"} onRetry={refetch} />;

  const stats = data?.data;

  return (
    <div>
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <h4>Total Revenue</h4>
          <p className="stat-value">${(stats?.totalRevenue ?? 0).toLocaleString()}</p>
        </div>
        <div className="stat-card stat-card-success">
          <h4>Orders</h4>
          <p className="stat-value">{stats?.totalOrders ?? 0}</p>
        </div>
        <div className="stat-card stat-card-accent">
          <h4>Products</h4>
          <p className="stat-value">{stats?.totalProducts ?? 0}</p>
        </div>
        <div className="stat-card stat-card-info">
          <h4>Users</h4>
          <p className="stat-value">{stats?.totalUsers ?? 0}</p>
        </div>
        <div className="stat-card stat-card-danger">
          <h4>Low Stock</h4>
          <p className="stat-value">{stats?.lowStockProducts ?? 0}</p>
        </div>
      </div>

      <div className="dashboard-revenue">
        <h3>Revenue</h3>
        <div className="revenue-cards">
          <div className="revenue-card">
            <h4>Today</h4>
            <p>${(stats?.revenueToday ?? 0).toLocaleString()}</p>
          </div>
          <div className="revenue-card">
            <h4>This Month</h4>
            <p>${(stats?.revenueThisMonth ?? 0).toLocaleString()}</p>
          </div>
          <div className="revenue-card">
            <h4>This Year</h4>
            <p>${(stats?.revenueThisYear ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h3>Orders by Status</h3>
            <Link to="/admin/orders" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="status-list">
            {(stats?.ordersByStatus ?? []).length === 0 ? (
              <p className="empty-small">No orders yet.</p>
            ) : (
              (stats?.ordersByStatus ?? []).map((s) => (
                <div key={s.status} className="status-row">
                  <span className={`badge badge-${s.status.toLowerCase()}`}>{s.status}</span>
                  <span className="status-count">{s.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h3>Products by Category</h3>
            <Link to="/admin/products" className="btn btn-secondary btn-sm">Manage</Link>
          </div>
          <div className="status-list">
            {(stats?.productsByCategory ?? []).length === 0 ? (
              <p className="empty-small">No products.</p>
            ) : (
              (stats?.productsByCategory ?? []).map((c) => (
                <div key={c.category} className="status-row">
                  <span>{c.category}</span>
                  <span className="status-count">{c.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h3>Recent Orders</h3>
          <Link to="/admin/orders" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        {(stats?.recentOrders ?? []).length === 0 ? (
          <p className="empty-small">No orders yet.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentOrders ?? []).map((o) => (
                  <tr key={o.id}>
                    <td className="order-id-cell">#{o.id.slice(0, 8)}</td>
                    <td>{o.user?.email || "—"}</td>
                    <td>{o.items.length}</td>
                    <td>${o.total.toFixed(2)}</td>
                    <td><span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span></td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
