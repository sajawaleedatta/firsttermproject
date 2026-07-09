import { useState } from "react";
import { Link } from "react-router-dom";
import { useProducts, useDeleteProduct } from "../../hooks/useApi";
import Spinner from "../../components/Spinner";
import ErrorMessage from "../../components/ErrorMessage";

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useProducts({ page, limit: 10 });
  const deleteMutation = useDeleteProduct();

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    deleteMutation.mutate(id);
  };

  if (isLoading) return <Spinner size="lg" text="Loading products..." />;
  if (isError) return <ErrorMessage message={error instanceof Error ? error.message : "Failed to load products"} onRetry={refetch} />;

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="admin-header">
        <h2>Manage Products</h2>
        <Link to="/admin/products/new" className="btn btn-primary">Add Product</Link>
      </div>
      <div className="admin-table-wrapper"><table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr><td colSpan={5} className="empty-cell">No products found.</td></tr>
          ) : (
            products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category || "—"}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)} disabled={deleteMutation.isPending}>
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table></div>
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {page} of {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
