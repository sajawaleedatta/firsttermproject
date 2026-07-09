import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Products from "../../pages/Products";

const mockProducts = {
  data: {
    data: [
      { id: "1", name: "MacBook Pro", description: "Powerful laptop", price: 1999.99, images: ["/uploads/laptop.jpg"], category: "Laptops", stock: 10, userId: "admin-1", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
      { id: "2", name: "iPhone 15", description: "Latest smartphone", price: 999.99, images: ["/uploads/iphone.jpg"], category: "Mobile", stock: 15, userId: "admin-1", createdAt: "2026-01-02T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z" },
    ],
    pagination: { page: 1, limit: 12, total: 2, totalPages: 1 },
  },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock("../../hooks/useApi", () => ({
  useProducts: () => mockProducts,
}));

function renderProducts() {
  return render(
    <MemoryRouter initialEntries={["/products"]}>
      <Products />
    </MemoryRouter>
  );
}

describe("Products", () => {
  beforeEach(() => {
    mockProducts.isLoading = false;
    mockProducts.isError = false;
    mockProducts.error = null;
    mockProducts.data.data = [
      { id: "1", name: "MacBook Pro", description: "Powerful laptop", price: 1999.99, images: ["/uploads/laptop.jpg"], category: "Laptops", stock: 10, userId: "admin-1", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
      { id: "2", name: "iPhone 15", description: "Latest smartphone", price: 999.99, images: ["/uploads/iphone.jpg"], category: "Mobile", stock: 15, userId: "admin-1", createdAt: "2026-01-02T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z" },
    ];
    mockProducts.data.pagination = { page: 1, limit: 12, total: 2, totalPages: 1 };
  });

  it("renders products heading with count", () => {
    renderProducts();
    expect(screen.getByText("Products (2)")).toBeInTheDocument();
  });

  it("renders filter sidebar", () => {
    renderProducts();
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search products...")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Min Price")).toBeInTheDocument();
    expect(screen.getByText("Max Price")).toBeInTheDocument();
  });

  it("renders product cards from data", () => {
    renderProducts();
    expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    expect(screen.getByText("iPhone 15")).toBeInTheDocument();
  });

  it("renders sort dropdown", () => {
    renderProducts();
    expect(screen.getByText("Newest")).toBeInTheDocument();
    expect(screen.getByText("Price: Low to High")).toBeInTheDocument();
  });

  it("shows spinner when loading", () => {
    mockProducts.isLoading = true;
    mockProducts.data.data = [];
    renderProducts();
    expect(screen.getByText("Loading products...")).toBeInTheDocument();
  });

  it("shows error message on error", () => {
    mockProducts.isLoading = false;
    mockProducts.isError = true;
    mockProducts.error = new Error("Failed to fetch products");
    renderProducts();
    expect(screen.getByText("Failed to fetch products")).toBeInTheDocument();
  });

  it("shows empty state when no products", () => {
    mockProducts.isLoading = false;
    mockProducts.data.data = [];
    renderProducts();
    expect(screen.getByText("No products found.")).toBeInTheDocument();
  });

  it("shows pagination when multiple pages", () => {
    mockProducts.data.pagination = { page: 1, limit: 12, total: 24, totalPages: 2 };
    renderProducts();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
  });

  it("disables previous button on first page", () => {
    mockProducts.data.pagination = { page: 1, limit: 12, total: 24, totalPages: 2 };
    renderProducts();
    expect(screen.getByText("Previous")).toBeDisabled();
  });

  it("renders product cards as links", () => {
    renderProducts();
    const links = document.querySelectorAll("a.product-card");
    expect(links.length).toBe(2);
  });
});
