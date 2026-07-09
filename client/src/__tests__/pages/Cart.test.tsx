import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Cart from "../../pages/Cart";

const mockCartData = {
  data: {
    data: {
      id: "cart-1",
      userId: "user-1",
      items: [
        {
          id: "ci-1",
          cartId: "cart-1",
          productId: "1",
          quantity: 2,
          product: { id: "1", name: "MacBook Pro", price: 1999.99, images: ["/uploads/laptop.jpg"], stock: 10 },
        },
      ],
      total: 3999.98,
    },
  },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

const mockUpdateMutation = { mutate: vi.fn(), isPending: false };
const mockRemoveMutation = { mutate: vi.fn(), isPending: false };
let mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual as Record<string, unknown>,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../hooks/useApi", () => ({
  useCart: () => mockCartData,
  useUpdateCartItem: () => mockUpdateMutation,
  useRemoveFromCart: () => mockRemoveMutation,
}));

const mockAuth = { user: { id: "user-1", name: "John", email: "john@test.com", role: "CUSTOMER" }, loading: false };
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

function renderCart() {
  return render(
    <MemoryRouter>
      <Cart />
    </MemoryRouter>
  );
}

describe("Cart", () => {
  beforeEach(() => {
    mockCartData.isLoading = false;
    mockCartData.isError = false;
    mockCartData.data.data.items = [
      { id: "ci-1", cartId: "cart-1", productId: "1", quantity: 2, product: { id: "1", name: "MacBook Pro", price: 1999.99, images: ["/uploads/laptop.jpg"], stock: 10 } },
    ];
    mockCartData.data.data.total = 3999.98;
    mockAuth.user = { id: "user-1", name: "John", email: "john@test.com", role: "CUSTOMER" };
    mockAuth.loading = false;
    mockUpdateMutation.isPending = false;
    mockRemoveMutation.isPending = false;
    mockNavigate.mockReset();
    mockUpdateMutation.mutate.mockReset();
    mockRemoveMutation.mutate.mockReset();
  });

  it("renders shopping cart heading", () => {
    renderCart();
    expect(screen.getByText("Shopping Cart")).toBeInTheDocument();
  });

  it("renders cart items", () => {
    renderCart();
    expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    expect(screen.getAllByText((c) => c.includes("3999.98")).length).toBeGreaterThanOrEqual(1);
  });

  it("renders quantity controls", () => {
    renderCart();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.getByText("+")).toBeInTheDocument();
  });

  it("renders remove button", () => {
    renderCart();
    expect(screen.getByText("Remove")).toBeInTheDocument();
  });

  it("renders total and checkout button", () => {
    renderCart();
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
    expect(screen.getAllByText((c) => c.includes("3999.98")).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Proceed to Checkout")).toBeInTheDocument();
  });

  it("navigates to checkout when checkout clicked", () => {
    renderCart();
    fireEvent.click(screen.getByText("Proceed to Checkout"));
    expect(mockNavigate).toHaveBeenCalledWith("/checkout");
  });

  it("calls updateMutation when + clicked", () => {
    renderCart();
    fireEvent.click(screen.getByText("+"));
    expect(mockUpdateMutation.mutate).toHaveBeenCalledWith({ productId: "1", quantity: 3 });
  });

  it("calls updateMutation when - clicked", () => {
    renderCart();
    fireEvent.click(screen.getByText("-"));
    expect(mockUpdateMutation.mutate).toHaveBeenCalledWith({ productId: "1", quantity: 1 });
  });

  it("calls removeMutation when remove clicked", () => {
    renderCart();
    fireEvent.click(screen.getByText("Remove"));
    expect(mockRemoveMutation.mutate).toHaveBeenCalledWith("1");
  });

  it("shows empty cart message when no items", () => {
    mockCartData.data.data.items = [];
    renderCart();
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByText("Browse Products")).toBeInTheDocument();
  });

  it("shows spinner when loading", () => {
    mockCartData.isLoading = true;
    renderCart();
    expect(screen.getByText("Loading cart...")).toBeInTheDocument();
  });

  it("shows error on error", () => {
    mockCartData.isLoading = false;
    mockCartData.isError = true;
    mockCartData.error = new Error("Failed to load cart");
    renderCart();
    expect(screen.getByText("Failed to load cart")).toBeInTheDocument();
  });

  it("redirects to login when not authenticated", () => {
    mockAuth.user = null;
    mockAuth.loading = false;
    renderCart();
    expect(screen.queryByText("Shopping Cart")).not.toBeInTheDocument();
  });

  it("shows Removing... when remove is pending", () => {
    mockRemoveMutation.isPending = true;
    renderCart();
    expect(screen.getByText("Removing...")).toBeInTheDocument();
  });
});
