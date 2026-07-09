import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminUsers from "../../../pages/admin/AdminUsers";

const mockUsersData = {
  data: {
    data: [
      { id: "user-1", email: "john@test.com", name: "John", role: "CUSTOMER", createdAt: "2026-01-01T00:00:00.000Z" },
      { id: "admin-1", email: "admin@test.com", name: "Admin", role: "ADMIN", createdAt: "2026-01-01T00:00:00.000Z" },
    ],
  },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

const mockDeleteMutation = { mutate: vi.fn(), isPending: false };

vi.mock("../../../hooks/useApi", () => ({
  useAdminUsers: () => mockUsersData,
  useDeleteUser: () => mockDeleteMutation,
}));

const originalConfirm = window.confirm;

function renderAdminUsers() {
  return render(
    <MemoryRouter>
      <AdminUsers />
    </MemoryRouter>
  );
}

describe("AdminUsers", () => {
  beforeEach(() => {
    mockUsersData.isLoading = false;
    mockUsersData.isError = false;
    mockDeleteMutation.mutate.mockReset();
    mockDeleteMutation.isPending = false;
    window.confirm = vi.fn(() => true);
  });

  afterAll(() => {
    window.confirm = originalConfirm;
  });

  it("renders manage users heading", () => {
    renderAdminUsers();
    expect(screen.getByText("Manage Users")).toBeInTheDocument();
  });

  it("renders user rows", () => {
    renderAdminUsers();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("john@test.com")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("admin@test.com")).toBeInTheDocument();
  });

  it("shows role badges", () => {
    renderAdminUsers();
    expect(screen.getByText("CUSTOMER")).toBeInTheDocument();
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
  });

  it("shows delete button for non-admin users", () => {
    renderAdminUsers();
    const deleteButtons = screen.getAllByText("Delete");
    expect(deleteButtons.length).toBe(1); // Only for CUSTOMER role
  });

  it("calls confirm and delete on delete click", () => {
    renderAdminUsers();
    fireEvent.click(screen.getByText("Delete"));
    expect(window.confirm).toHaveBeenCalledWith('Delete user "john@test.com"?');
    expect(mockDeleteMutation.mutate).toHaveBeenCalledWith("user-1");
  });

  it("does not delete when confirm is cancelled", () => {
    window.confirm = vi.fn(() => false);
    renderAdminUsers();
    fireEvent.click(screen.getByText("Delete"));
    expect(mockDeleteMutation.mutate).not.toHaveBeenCalled();
  });

  it("shows Deleting... when pending", () => {
    mockDeleteMutation.isPending = true;
    renderAdminUsers();
    expect(screen.getByText("Deleting...")).toBeInTheDocument();
  });

  it("shows empty row when no users", () => {
    mockUsersData.data.data = [];
    renderAdminUsers();
    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });

  it("shows spinner when loading", () => {
    mockUsersData.isLoading = true;
    renderAdminUsers();
    expect(screen.getByText("Loading users...")).toBeInTheDocument();
  });

  it("shows error on failure", () => {
    mockUsersData.isLoading = false;
    mockUsersData.isError = true;
    mockUsersData.error = new Error("Failed to load");
    renderAdminUsers();
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });
});
