import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";

const mockAuth = { user: null, loading: false };

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

function renderAdminLayout() {
  return render(
    <MemoryRouter>
      <AdminLayout><div data-testid="children">Admin Content</div></AdminLayout>
    </MemoryRouter>
  );
}

describe("AdminLayout", () => {
  beforeEach(() => {
    mockAuth.user = null;
    mockAuth.loading = false;
  });

  it("renders children when user is admin", () => {
    mockAuth.user = { id: "1", name: "Admin", email: "admin@test.com", role: "ADMIN" };
    renderAdminLayout();
    expect(screen.getByTestId("children")).toBeInTheDocument();
    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("renders sidebar when user is admin", () => {
    mockAuth.user = { id: "1", name: "Admin", email: "admin@test.com", role: "ADMIN" };
    renderAdminLayout();
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("redirects to login when not authenticated", () => {
    mockAuth.user = null;
    renderAdminLayout();
    expect(screen.queryByTestId("children")).not.toBeInTheDocument();
  });

  it("redirects to login when user is not admin", () => {
    mockAuth.user = { id: "1", name: "John", email: "john@test.com", role: "CUSTOMER" };
    renderAdminLayout();
    expect(screen.queryByTestId("children")).not.toBeInTheDocument();
  });

  it("shows spinner when loading", () => {
    mockAuth.loading = true;
    renderAdminLayout();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByTestId("children")).not.toBeInTheDocument();
  });
});
