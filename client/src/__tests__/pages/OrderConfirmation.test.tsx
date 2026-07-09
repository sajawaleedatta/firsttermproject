import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OrderConfirmation from "../../pages/OrderConfirmation";

const mockOrder = {
  data: {
    data: {
      id: "order-1",
      userId: "user-1",
      total: 1999.99,
      status: "PENDING",
      paymentMethod: "CASH",
      paymentStatus: "PENDING",
      items: [
        { id: "oi-1", productId: "1", quantity: 1, price: 1999.99, product: { id: "1", name: "MacBook Pro", price: 1999.99, images: ["/uploads/laptop.jpg"] } },
      ],
      createdAt: "2026-01-10T00:00:00.000Z",
      updatedAt: "2026-01-10T00:00:00.000Z",
    },
  },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual as Record<string, unknown>,
    useParams: () => ({ id: "order-1" }),
  };
});

vi.mock("../../hooks/useApi", () => ({
  useOrder: () => mockOrder,
}));

function renderOrderConfirmation() {
  return render(
    <MemoryRouter>
      <OrderConfirmation />
    </MemoryRouter>
  );
}

describe("OrderConfirmation", () => {
  beforeEach(() => {
    mockOrder.isLoading = false;
    mockOrder.isError = false;
    mockOrder.error = null;
  });

  it("renders order confirmed heading", () => {
    renderOrderConfirmation();
    expect(screen.getByText("Order Confirmed!")).toBeInTheDocument();
  });

  it("renders success message", () => {
    renderOrderConfirmation();
    expect(screen.getByText(/Thank you for your purchase/)).toBeInTheDocument();
  });

  it("renders order ID", () => {
    renderOrderConfirmation();
    expect(screen.getByText("order-1")).toBeInTheDocument();
  });

  it("renders order status", () => {
    renderOrderConfirmation();
    const pendingElements = screen.getAllByText("PENDING");
    expect(pendingElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders payment method", () => {
    renderOrderConfirmation();
    expect(screen.getByText("Cash on Delivery")).toBeInTheDocument();
  });

  it("renders card payment for VISA", () => {
    mockOrder.data.data = { ...mockOrder.data.data, paymentMethod: "VISA" };
    renderOrderConfirmation();
    expect(screen.getByText("Card Payment")).toBeInTheDocument();
  });

  it("renders payment status", () => {
    renderOrderConfirmation();
    const pendingElements = screen.getAllByText("PENDING");
    expect(pendingElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders total", () => {
    renderOrderConfirmation();
    expect(screen.getAllByText((c) => c === "$1999.99").length).toBeGreaterThanOrEqual(1);
  });

  it("renders items heading", () => {
    renderOrderConfirmation();
    expect(screen.getByText("Items")).toBeInTheDocument();
  });

  it("renders product name in items", () => {
    renderOrderConfirmation();
    expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
  });

  it("renders item quantity and price", () => {
    renderOrderConfirmation();
    expect(screen.getByText("Qty: 1 × $1999.99")).toBeInTheDocument();
  });

  it("renders action links", () => {
    renderOrderConfirmation();
    expect(screen.getByText("View All Orders")).toBeInTheDocument();
    expect(screen.getByText("Continue Shopping")).toBeInTheDocument();
  });

  it("shows spinner when loading", () => {
    mockOrder.isLoading = true;
    renderOrderConfirmation();
    expect(screen.getByText("Loading order...")).toBeInTheDocument();
  });

  it("shows error message on error", () => {
    mockOrder.isLoading = false;
    mockOrder.isError = true;
    mockOrder.error = new Error("Order not found");
    renderOrderConfirmation();
    expect(screen.getByText("Order not found")).toBeInTheDocument();
  });

  it("shows order not found when data is null", () => {
    mockOrder.data.data = null as unknown as typeof mockOrder.data.data;
    renderOrderConfirmation();
    expect(screen.getByText("Order not found.")).toBeInTheDocument();
  });
});
