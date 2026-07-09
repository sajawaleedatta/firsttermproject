import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Orders from "../../pages/Orders";

const mockOrdersData = {
  data: {
    data: [
      {
        id: "order-1",
        userId: "user-1",
        total: 1999.99,
        status: "PENDING",
        paymentMethod: "CASH",
        paymentStatus: "PENDING",
        items: [
          { id: "oi-1", productId: "1", quantity: 1, price: 1999.99, product: { id: "1", name: "MacBook Pro", price: 1999.99, images: ["/uploads/laptop.jpg"] } },
        ],
        user: { id: "user-1", email: "john@test.com", name: "John" },
        createdAt: "2026-01-10T00:00:00.000Z",
        updatedAt: "2026-01-10T00:00:00.000Z",
      },
      {
        id: "order-2",
        userId: "user-1",
        total: 999.99,
        status: "DELIVERED",
        paymentMethod: "VISA",
        paymentStatus: "PAID",
        items: [
          { id: "oi-2", productId: "2", quantity: 1, price: 999.99, product: { id: "2", name: "iPhone 15", price: 999.99, images: ["/uploads/iphone.jpg"] } },
          { id: "oi-3", productId: "3", quantity: 2, price: 499.99, product: { id: "3", name: "Accessory", price: 499.99, images: [] } },
          { id: "oi-4", productId: "4", quantity: 1, price: 299.99, product: { id: "4", name: "Case", price: 299.99, images: [] } },
          { id: "oi-5", productId: "5", quantity: 1, price: 199.99, product: { id: "5", name: "Charger", price: 199.99, images: [] } },
        ],
        user: { id: "user-1", email: "john@test.com", name: "John" },
        createdAt: "2026-01-05T00:00:00.000Z",
        updatedAt: "2026-01-07T00:00:00.000Z",
      },
    ],
  },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock("../../hooks/useApi", () => ({
  useMyOrders: () => mockOrdersData,
}));

const mockAuth = { user: { id: "user-1", name: "John", email: "john@test.com", role: "CUSTOMER" }, loading: false };
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

function renderOrders() {
  return render(
    <MemoryRouter>
      <Orders />
    </MemoryRouter>
  );
}

describe("Orders", () => {
  beforeEach(() => {
    mockOrdersData.isLoading = false;
    mockOrdersData.isError = false;
    mockOrdersData.error = null;
  });

  it("renders orders heading", () => {
    renderOrders();
    expect(screen.getByText("My Orders")).toBeInTheDocument();
  });

  it("renders order cards", () => {
    renderOrders();
    expect(screen.getByText(/Order #order-1/)).toBeInTheDocument();
    expect(screen.getByText(/Order #order-2/)).toBeInTheDocument();
  });

  it("renders order status badges", () => {
    renderOrders();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(screen.getByText("DELIVERED")).toBeInTheDocument();
  });

  it("renders order totals", () => {
    renderOrders();
    expect(screen.getByText((c) => c === "Total: $1999.99")).toBeInTheDocument();
    expect(screen.getByText((c) => c === "Total: $999.99")).toBeInTheDocument();
  });

  it("renders view details links", () => {
    renderOrders();
    const links = screen.getAllByText("View Details");
    expect(links.length).toBe(2);
  });

  it("shows first 3 items in order card", () => {
    renderOrders();
    expect(screen.getByText("iPhone 15 × 1")).toBeInTheDocument();
    expect(screen.getByText("Accessory × 2")).toBeInTheDocument();
    expect(screen.getByText("Case × 1")).toBeInTheDocument();
  });

  it("shows more items count when >3 items", () => {
    renderOrders();
    // order-2 has 4 items, shows +1 more items
    expect(screen.getByText("+1 more items")).toBeInTheDocument();
  });

  it("shows empty state when no orders", () => {
    mockOrdersData.data.data = [];
    renderOrders();
    expect(screen.getByText("No orders yet")).toBeInTheDocument();
    expect(screen.getByText("Start Shopping")).toBeInTheDocument();
  });

  it("shows spinner when loading", () => {
    mockOrdersData.isLoading = true;
    renderOrders();
    expect(screen.getByText("Loading orders...")).toBeInTheDocument();
  });

  it("shows error message on error", () => {
    mockOrdersData.isLoading = false;
    mockOrdersData.isError = true;
    mockOrdersData.error = new Error("Failed to load orders");
    renderOrders();
    expect(screen.getByText("Failed to load orders")).toBeInTheDocument();
  });

  it("redirects to login when not authenticated", () => {
    mockAuth.user = null;
    mockAuth.loading = false;
    renderOrders();
    expect(screen.queryByText("My Orders")).not.toBeInTheDocument();
  });
});
