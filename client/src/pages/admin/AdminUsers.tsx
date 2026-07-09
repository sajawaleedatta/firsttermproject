import { useAdminUsers, useDeleteUser } from "../../hooks/useApi";
import Spinner from "../../components/Spinner";
import ErrorMessage from "../../components/ErrorMessage";

export default function AdminUsers() {
  const { data, isLoading, isError, error, refetch } = useAdminUsers();
  const deleteMutation = useDeleteUser();

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Delete user "${email}"?`)) return;
    deleteMutation.mutate(id);
  };

  if (isLoading) return <Spinner size="lg" text="Loading users..." />;
  if (isError) return <ErrorMessage message={error instanceof Error ? error.message : "Failed to load users"} onRetry={refetch} />;

  const users = data?.data ?? [];

  return (
    <div>
      <h2>Manage Users</h2>
      <div className="admin-table-wrapper"><table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan={5} className="empty-cell">No users found.</td></tr>
          ) : (
            users.map((u) => (
              <tr key={u.id}>
                <td>{u.name || "—"}</td>
                <td>{u.email}</td>
                <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  {u.role !== "ADMIN" && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, u.email)} disabled={deleteMutation.isPending}>
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table></div>
    </div>
  );
}
