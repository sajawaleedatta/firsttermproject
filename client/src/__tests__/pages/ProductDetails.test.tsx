import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductDetails from "../../pages/ProductDetails";

const mockProduct = {
  data: {
    data: {
      id: "1",
      name: "MacBook Pro",
      description: "Powerful laptop",
      price: 1999.99,
      images: ["/uploads/laptop.jpg", "/uploads/laptop2.jpg"],
      category: "Laptops",
      stock: 10,
      userId: "admin-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

const mockAddToCart = { mutate: vi.fn(), isPending: false };
let mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual as Record<string, unknown>,
    useParams: () => ({ id: "1" }),
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../hooks/useApi", () => ({
  useProduct: () => mockProduct,
  useAddToCart: () => mockAddToCart,
}));

const mockAuth = { user: { id: "user-1", name: "John", email: "john@test.com", role: "CUSTOMER" } };
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

function renderProductDetails() {
  return render(
    <MemoryRouter>
      <ProductDetails />
    </MemoryRouter>
  );
}

describe("ProductDetails", () => {
  beforeEach(() => {
    mockProduct.isLoading = false;
    mockProduct.isError = false;
    mockProduct.data.data = {
      id: "1", name: "MacBook Pro", description: "Powerful laptop", price: 1999.99,
      images: ["/uploads/laptop.jpg", "/uploads/laptop2.jpg"], category: "Laptops",
      stock: 10, userId: "admin-1", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
    };
    mockAuth.user = { id: "user-1", name: "John", email: "john@test.com", role: "CUSTOMER" };
    mockNavigate.mockReset();
    mockAddToCart.mutate.mockReset();
    mockAddToCart.isPending = false;
  });

  it("renders product name and price", () => {
    renderProductDetails();
    expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    expect(screen.getByText("$1999.99")).toBeInTheDocument();
  });

  it("renders product category", () => {
    renderProductDetails();
    expect(screen.getByText("Laptops")).toBeInTheDocument();
  });

  it("renders stock info", () => {
    renderProductDetails();
    expect(screen.getByText("In Stock (10 available)")).toBeInTheDocument();
  });

  it("renders description", () => {
    renderProductDetails();
    expect(screen.getByText("Powerful laptop")).toBeInTheDocument();
  });

  it("renders add to cart button", () => {
    renderProductDetails();
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
  });

  it("shows out of stock when stock is 0", () => {
    mockProduct.data.data = { ...mockProduct.data.data, stock: 0 };
    renderProductDetails();
    const stockElements = screen.getAllByText("Out of Stock");
    expect(stockElements.length).toBe(2);
    expect(screen.getByRole("button", { name: "Out of Stock" })).toBeDisabled();
  });

  it("shows spinner when loading", () => {
    mockProduct.isLoading = true;
    renderProductDetails();
    expect(screen.getByText("Loading product...")).toBeInTheDocument();
  });

  it("shows error message on error", () => {
    mockProduct.isLoading = false;
    mockProduct.isError = true;
    mockProduct.error = new Error("Product not found");
    renderProductDetails();
    expect(screen.getByText("Product not found")).toBeInTheDocument();
  });

  it("navigates to login when guest clicks add to cart", () => {
    mockAuth.user = null;
    renderProductDetails();
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("calls addToCart when logged in user clicks add to cart", () => {
    renderProductDetails();
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(mockAddToCart.mutate).toHaveBeenCalledWith(
      { productId: "1", quantity: 1 },
      expect.any(Object)
    );
  });

  it("shows Adding... when mutation is pending", () => {
    mockAddToCart.isPending = true;
    renderProductDetails();
    expect(screen.getByText("Adding...")).toBeInTheDocument();
  });

  it("renders image thumbnails when multiple images", () => {
    renderProductDetails();
    const thumbnails = document.querySelectorAll(".thumb-btn");
    expect(thumbnails.length).toBe(2);
  });

  it("switches selected image on thumbnail click", () => {
    renderProductDetails();
    const thumbnails = document.querySelectorAll(".thumb-btn");
    fireEvent.click(thumbnails[1]);
    expect(thumbnails[1]).toHaveClass("active");
  });

  it("renders placeholder when no images", () => {
    mockProduct.data.data = { ...mockProduct.data.data, images: [] };
    renderProductDetails();
    expect(screen.getByText("No Image")).toBeInTheDocument();
  });
});
