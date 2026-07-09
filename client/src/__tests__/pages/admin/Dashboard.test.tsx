import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "../../../pages/admin/Dashboard";

const mockStats = {
  data: {
    data: {
      totalProducts: 10,
      totalUsers: 5,
      totalOrders: 20,
      lowStockProducts: 2,
      totalRevenue: 50000,
      revenueToday: 500,
      revenueThisMonth: 12000,
      revenueThisYear: 50000,
      ordersByStatus: [
        { status: "PENDING", count: 5 },
        { status: "CONFIRMED", count: 3 },
        { status: "DELIVERED", count: 12 },
      ],
      productsByCategory: [
        { category: "Laptops", count: 3 },
        { category: "Mobile", count: 4 },
      ],
      recentOrders: [
        {
          id: "order-1", userId: "user-1", total: 1999.99, status: "PENDING", paymentMethod: "CASH", paymentStatus: "PENDING",
          items: [{ id: "oi-1", productId: "1", quantity: 1, price: 1999.99, product: { id: "1", name: "MacBook Pro", price: 1999.99, images: [] } }],
          user: { id: "user-1", email: "john@test.com", name: "John" },
          createdAt: "2026-01-10T00:00:00.000Z", updatedAt: "2026-01-10T00:00:00.000Z",
        },
      ],
    },
  },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock("../../../hooks/useApi", () => ({
  useAdminStats: () => mockStats,
}));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
}

describe("AdminDashboard", () => {
  beforeEach(() => {
    mockStats.isLoading = false;
    mockStats.isError = false;
    mockStats.error = null;
  });

  it("renders dashboard heading", () => {
    renderDashboard();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders stat cards", () => {
    renderDashboard();
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Low Stock")).toBeInTheDocument();
  });

  it("renders stat values", () => {
    renderDashboard();
    expect(screen.getAllByText("$50,000").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders revenue section", () => {
    renderDashboard();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("This Month")).toBeInTheDocument();
    expect(screen.getByText("This Year")).toBeInTheDocument();
  });

  it("renders revenue values", () => {
    renderDashboard();
    expect(screen.getByText("$500")).toBeInTheDocument();
    expect(screen.getByText("$12,000")).toBeInTheDocument();
    expect(screen.getAllByText("$50,000").length).toBeGreaterThanOrEqual(1);
  });

  it("renders orders by status section", () => {
    renderDashboard();
    expect(screen.getByText("Orders by Status")).toBeInTheDocument();
    expect(screen.getAllByText("PENDING").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
    expect(screen.getByText("DELIVERED")).toBeInTheDocument();
  });

  it("renders products by category", () => {
    renderDashboard();
    expect(screen.getByText("Products by Category")).toBeInTheDocument();
    expect(screen.getByText("Laptops")).toBeInTheDocument();
    expect(screen.getByText("Mobile")).toBeInTheDocument();
  });

  it("renders recent orders table", () => {
    renderDashboard();
    expect(screen.getByText("Recent Orders")).toBeInTheDocument();
    expect(screen.getByText("john@test.com")).toBeInTheDocument();
  });

  it("shows spinner when loading", () => {
    mockStats.isLoading = true;
    renderDashboard();
    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });

  it("shows error on failure", () => {
    mockStats.isLoading = false;
    mockStats.isError = true;
    mockStats.error = new Error("Failed to load stats");
    renderDashboard();
    expect(screen.getByText("Failed to load stats")).toBeInTheDocument();
  });

  it("shows empty state for no orders", () => {
    mockStats.data.data.ordersByStatus = [];
    mockStats.data.data.recentOrders = [];
    renderDashboard();
    expect(screen.getAllByText("No orders yet.").length).toBe(2);
  });

  it("shows empty state for no products", () => {
    mockStats.data.data.productsByCategory = [];
    renderDashboard();
    expect(screen.getByText("No products.")).toBeInTheDocument();
  });
});
