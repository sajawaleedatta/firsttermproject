import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminOrders from "../../../pages/admin/AdminOrders";

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
        items: [{ id: "oi-1", productId: "1", quantity: 1, price: 1999.99, product: { id: "1", name: "MacBook Pro", price: 1999.99, images: [] } }],
        user: { id: "user-1", email: "john@test.com", name: "John" },
        createdAt: "2026-01-10T00:00:00.000Z",
        updatedAt: "2026-01-10T00:00:00.000Z",
      },
      {
        id: "order-2",
        userId: "user-2",
        total: 999.99,
        status: "SHIPPED",
        paymentMethod: "VISA",
        paymentStatus: "PAID",
        items: [{ id: "oi-2", productId: "2", quantity: 1, price: 999.99, product: { id: "2", name: "iPhone 15", price: 999.99, images: [] } }],
        user: { id: "user-2", email: "jane@test.com", name: "Jane" },
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

const mockUpdateMutation = { mutate: vi.fn(), isPending: false };

vi.mock("../../../hooks/useApi", () => ({
  useAdminOrders: () => mockOrdersData,
  useUpdateOrderStatus: () => mockUpdateMutation,
}));

function renderAdminOrders() {
  return render(
    <MemoryRouter>
      <AdminOrders />
    </MemoryRouter>
  );
}

describe("AdminOrders", () => {
  beforeEach(() => {
    mockOrdersData.isLoading = false;
    mockOrdersData.isError = false;
    mockUpdateMutation.mutate.mockReset();
    mockUpdateMutation.isPending = false;
  });

  it("renders manage orders heading", () => {
    renderAdminOrders();
    expect(screen.getByText("Manage Orders")).toBeInTheDocument();
  });

  it("renders order rows", () => {
    renderAdminOrders();
    expect(screen.getByText("#order-1")).toBeInTheDocument();
    expect(screen.getByText("#order-2")).toBeInTheDocument();
    expect(screen.getByText("john@test.com")).toBeInTheDocument();
    expect(screen.getByText("jane@test.com")).toBeInTheDocument();
  });

  it("renders order totals", () => {
    renderAdminOrders();
    expect(screen.getByText((c) => c.includes("1999.99"))).toBeInTheDocument();
    expect(screen.getByText((c) => c === "$999.99")).toBeInTheDocument();
  });

  it("renders payment info", () => {
    renderAdminOrders();
    expect(screen.getByText("CASH / PENDING")).toBeInTheDocument();
    expect(screen.getByText("VISA / PAID")).toBeInTheDocument();
  });

  it("renders status badges", () => {
    renderAdminOrders();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(screen.getByText("SHIPPED")).toBeInTheDocument();
  });

  it("shows Confirm button for PENDING orders", () => {
    renderAdminOrders();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("shows Deliver button for SHIPPED orders", () => {
    renderAdminOrders();
    expect(screen.getByText("Deliver")).toBeInTheDocument();
  });

  it("shows Mark Paid button for PENDING payment", () => {
    renderAdminOrders();
    const markPaidButtons = screen.getAllByText("Mark Paid");
    expect(markPaidButtons.length).toBe(1); // Only order-1 has PENDING payment
  });

  it("calls updateStatus with CONFIRMED when Confirm clicked", () => {
    renderAdminOrders();
    fireEvent.click(screen.getByText("Confirm"));
    expect(mockUpdateMutation.mutate).toHaveBeenCalledWith({ id: "order-1", data: { status: "CONFIRMED" } });
  });

  it("calls updateStatus with DELIVERED when Deliver clicked", () => {
    renderAdminOrders();
    fireEvent.click(screen.getByText("Deliver"));
    expect(mockUpdateMutation.mutate).toHaveBeenCalledWith({ id: "order-2", data: { status: "DELIVERED" } });
  });

  it("calls updatePayment with PAID when Mark Paid clicked", () => {
    renderAdminOrders();
    fireEvent.click(screen.getByText("Mark Paid"));
    expect(mockUpdateMutation.mutate).toHaveBeenCalledWith({ id: "order-1", data: { paymentStatus: "PAID" } });
  });

  it("shows empty row when no orders", () => {
    mockOrdersData.data.data = [];
    renderAdminOrders();
    expect(screen.getByText("No orders found.")).toBeInTheDocument();
  });

  it("shows spinner when loading", () => {
    mockOrdersData.isLoading = true;
    renderAdminOrders();
    expect(screen.getByText("Loading orders...")).toBeInTheDocument();
  });

  it("shows error on failure", () => {
    mockOrdersData.isLoading = false;
    mockOrdersData.isError = true;
    mockOrdersData.error = new Error("Failed to load");
    renderAdminOrders();
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });
});
