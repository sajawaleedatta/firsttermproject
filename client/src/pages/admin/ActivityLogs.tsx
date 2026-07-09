import { useState } from "react";
import { useActivityLogs } from "../../hooks/useApi";
import Spinner from "../../components/Spinner";
import ErrorMessage from "../../components/ErrorMessage";

export default function ActivityLogs() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useActivityLogs(page);

  if (isLoading) return <Spinner size="lg" text="Loading activity logs..." />;
  if (isError) return <ErrorMessage message={error instanceof Error ? error.message : "Failed to load logs"} onRetry={refetch} />;

  const logs = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <h2>Activity Logs</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={4} className="empty-cell">No activity logs found.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td>{log.userEmail}</td>
                  <td><span className="badge badge-action">{log.action}</span></td>
                  <td>{log.resource}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
