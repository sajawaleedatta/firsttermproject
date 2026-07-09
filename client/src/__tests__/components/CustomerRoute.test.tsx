import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CustomerRoute from "../../components/CustomerRoute";

const mockAuth = { user: null, loading: false };

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

function renderCustomerRoute() {
  return render(
    <MemoryRouter>
      <CustomerRoute><div data-testid="children">Customer Content</div></CustomerRoute>
    </MemoryRouter>
  );
}

describe("CustomerRoute", () => {
  beforeEach(() => {
    mockAuth.user = null;
    mockAuth.loading = false;
  });

  it("renders children when user is not authenticated", () => {
    mockAuth.user = null;
    renderCustomerRoute();
    expect(screen.getByTestId("children")).toBeInTheDocument();
    expect(screen.getByText("Customer Content")).toBeInTheDocument();
  });

  it("renders children when user is CUSTOMER", () => {
    mockAuth.user = { id: "1", name: "John", email: "john@test.com", role: "CUSTOMER" };
    renderCustomerRoute();
    expect(screen.getByTestId("children")).toBeInTheDocument();
  });

  it("redirects to /admin when user is ADMIN", () => {
    mockAuth.user = { id: "1", name: "Admin", email: "admin@test.com", role: "ADMIN" };
    renderCustomerRoute();
    expect(screen.queryByTestId("children")).not.toBeInTheDocument();
  });

  it("shows spinner when loading", () => {
    mockAuth.loading = true;
    renderCustomerRoute();
    expect(document.querySelector(".spinner")).toBeInTheDocument();
    expect(screen.queryByTestId("children")).not.toBeInTheDocument();
  });
});
