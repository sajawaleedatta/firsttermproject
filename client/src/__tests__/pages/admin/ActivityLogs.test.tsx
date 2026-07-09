import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ActivityLogs from "../../../pages/admin/ActivityLogs";

const mockLogsData = {
  data: {
    data: [
      { _id: "log-1", userId: "admin-1", userEmail: "admin@test.com", action: "CREATE", resource: "Product", details: "Created MacBook Pro", createdAt: "2026-01-01T00:00:00.000Z" },
      { _id: "log-2", userId: "admin-1", userEmail: "admin@test.com", action: "UPDATE", resource: "Order", details: "Updated order status", createdAt: "2026-01-02T00:00:00.000Z" },
    ],
    pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
  },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock("../../../hooks/useApi", () => ({
  useActivityLogs: () => mockLogsData,
}));

function renderActivityLogs() {
  return render(
    <MemoryRouter>
      <ActivityLogs />
    </MemoryRouter>
  );
}

describe("ActivityLogs", () => {
  beforeEach(() => {
    mockLogsData.isLoading = false;
    mockLogsData.isError = false;
    mockLogsData.error = null;
  });

  it("renders activity logs heading", () => {
    renderActivityLogs();
    expect(screen.getByText("Activity Logs")).toBeInTheDocument();
  });

  it("renders log entries", () => {
    renderActivityLogs();
    expect(screen.getAllByText("admin@test.com").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("CREATE")).toBeInTheDocument();
    expect(screen.getByText("UPDATE")).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Order")).toBeInTheDocument();
  });

  it("shows empty row when no logs", () => {
    mockLogsData.data.data = [];
    renderActivityLogs();
    expect(screen.getByText("No activity logs found.")).toBeInTheDocument();
  });

  it("shows spinner when loading", () => {
    mockLogsData.isLoading = true;
    renderActivityLogs();
    expect(screen.getByText("Loading activity logs...")).toBeInTheDocument();
  });

  it("shows error on failure", () => {
    mockLogsData.isLoading = false;
    mockLogsData.isError = true;
    mockLogsData.error = new Error("Failed to load logs");
    renderActivityLogs();
    expect(screen.getByText("Failed to load logs")).toBeInTheDocument();
  });

  it("shows pagination when multiple pages", () => {
    mockLogsData.data.pagination = { page: 1, limit: 20, total: 40, totalPages: 2 };
    renderActivityLogs();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });

  it("disables previous on first page", () => {
    mockLogsData.data.pagination = { page: 1, limit: 20, total: 40, totalPages: 2 };
    renderActivityLogs();
    expect(screen.getByText("Previous")).toBeDisabled();
  });

  it("hides pagination when single page", () => {
    mockLogsData.data.pagination = { page: 1, limit: 20, total: 2, totalPages: 1 };
    renderActivityLogs();
    expect(screen.queryByText("Page 1 of 1")).not.toBeInTheDocument();
  });
});
