import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Checkout from "../../pages/Checkout";

const mockCart = {
  data: {
    data: {
      id: "cart-1",
      userId: "user-1",
      items: [
        { id: "ci-1", cartId: "cart-1", productId: "1", quantity: 2, product: { id: "1", name: "MacBook Pro", price: 1999.99, images: ["/uploads/laptop.jpg"], stock: 10 } },
      ],
      total: 3999.98,
    },
  },
  isLoading: false,
};

const mockCreateOrder = { mutate: vi.fn(), isPending: false, isError: false, error: null };
let mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual as Record<string, unknown>,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../hooks/useApi", () => ({
  useCart: () => mockCart,
  useCreateOrder: () => mockCreateOrder,
}));

function renderCheckout() {
  return render(
    <MemoryRouter>
      <Checkout />
    </MemoryRouter>
  );
}

describe("Checkout", () => {
  beforeEach(() => {
    mockCart.isLoading = false;
    mockCart.data.data.items = [
      { id: "ci-1", cartId: "cart-1", productId: "1", quantity: 2, product: { id: "1", name: "MacBook Pro", price: 1999.99, images: ["/uploads/laptop.jpg"], stock: 10 } },
    ];
    mockCart.data.data.total = 3999.98;
    mockCreateOrder.mutate.mockReset();
    mockCreateOrder.isPending = false;
    mockCreateOrder.isError = false;
    mockCreateOrder.error = null;
    mockNavigate.mockReset();
  });

  it("renders checkout heading", () => {
    renderCheckout();
    expect(screen.getByText("Checkout")).toBeInTheDocument();
  });

  it("renders order summary", () => {
    renderCheckout();
    expect(screen.getByText("Order Summary")).toBeInTheDocument();
    expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    expect(screen.getByText("Qty: 2")).toBeInTheDocument();
  });

  it("renders total", () => {
    renderCheckout();
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
    expect(screen.getAllByText((c) => c.includes("3999.98")).length).toBeGreaterThanOrEqual(1);
  });

  it("renders Cash on Delivery as default payment method", () => {
    renderCheckout();
    expect(screen.getByText("Cash on Delivery")).toBeInTheDocument();
  });

  it("renders Credit / Debit Card option", () => {
    renderCheckout();
    expect(screen.getByText("Credit / Debit Card")).toBeInTheDocument();
  });

  it("shows card form when VISA selected", () => {
    renderCheckout();
    fireEvent.click(screen.getByText("Credit / Debit Card"));
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("1234 5678 9012 3456")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("MM/YY")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("123")).toBeInTheDocument();
  });

  it("hides card form when CASH selected", () => {
    renderCheckout();
    fireEvent.click(screen.getByText("Credit / Debit Card"));
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cash on Delivery"));
    expect(screen.queryByPlaceholderText("John Doe")).not.toBeInTheDocument();
  });

  it("renders place order button with total", () => {
    renderCheckout();
    expect(screen.getByRole("button", { name: /place order/i })).toBeInTheDocument();
    expect(screen.getAllByText((c) => c.includes("3999.98")).length).toBeGreaterThanOrEqual(1);
  });

  it("calls createOrder on place order", () => {
    renderCheckout();
    fireEvent.click(screen.getByRole("button", { name: /place order/i }));
    expect(mockCreateOrder.mutate).toHaveBeenCalledWith("CASH", expect.any(Object));
  });

  it("shows Processing... when order is pending", () => {
    mockCreateOrder.isPending = true;
    renderCheckout();
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("shows error message on order failure", () => {
    mockCreateOrder.isError = true;
    mockCreateOrder.error = new Error("Payment failed");
    renderCheckout();
    expect(screen.getByText("Payment failed")).toBeInTheDocument();
  });

  it("renders empty cart state", () => {
    mockCart.data.data.items = [];
    renderCheckout();
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByText("Browse Products")).toBeInTheDocument();
  });

  it("shows spinner when cart is loading", () => {
    mockCart.isLoading = true;
    renderCheckout();
    expect(screen.getByText("Loading cart...")).toBeInTheDocument();
  });
});
