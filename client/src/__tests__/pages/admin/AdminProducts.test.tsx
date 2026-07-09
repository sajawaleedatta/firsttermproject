import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminProducts from "../../../pages/admin/AdminProducts";

const mockProducts = {
  data: {
    data: [
      { id: "1", name: "MacBook Pro", description: "Powerful laptop", price: 1999.99, images: ["/uploads/laptop.jpg"], category: "Laptops", stock: 10, userId: "admin-1", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
      { id: "2", name: "iPhone 15", description: "Latest smartphone", price: 999.99, images: ["/uploads/iphone.jpg"], category: "Mobile", stock: 15, userId: "admin-1", createdAt: "2026-01-02T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z" },
    ],
    pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
  },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

const mockDeleteMutation = { mutate: vi.fn(), isPending: false };

vi.mock("../../../hooks/useApi", () => ({
  useProducts: () => mockProducts,
  useDeleteProduct: () => mockDeleteMutation,
}));

const originalConfirm = window.confirm;

function renderAdminProducts() {
  return render(
    <MemoryRouter>
      <AdminProducts />
    </MemoryRouter>
  );
}

describe("AdminProducts", () => {
  beforeEach(() => {
    mockProducts.isLoading = false;
    mockProducts.isError = false;
    mockProducts.error = null;
    mockDeleteMutation.mutate.mockReset();
    mockDeleteMutation.isPending = false;
    window.confirm = vi.fn(() => true);
  });

  afterAll(() => {
    window.confirm = originalConfirm;
  });

  it("renders manage products heading", () => {
    renderAdminProducts();
    expect(screen.getByText("Manage Products")).toBeInTheDocument();
  });

  it("renders add product link", () => {
    renderAdminProducts();
    expect(screen.getByText("Add Product")).toBeInTheDocument();
  });

  it("renders product rows in table", () => {
    renderAdminProducts();
    expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    expect(screen.getByText("iPhone 15")).toBeInTheDocument();
    expect(screen.getByText((c) => c === "$1999.99")).toBeInTheDocument();
    expect(screen.getByText((c) => c === "$999.99")).toBeInTheDocument();
  });

  it("renders delete buttons for products", () => {
    renderAdminProducts();
    const deleteButtons = screen.getAllByText("Delete");
    expect(deleteButtons.length).toBe(2);
  });

  it("calls confirm and delete on delete click", () => {
    renderAdminProducts();
    fireEvent.click(screen.getAllByText("Delete")[0]);
    expect(window.confirm).toHaveBeenCalledWith('Delete "MacBook Pro"?');
    expect(mockDeleteMutation.mutate).toHaveBeenCalledWith("1");
  });

  it("does not delete when confirm is cancelled", () => {
    window.confirm = vi.fn(() => false);
    renderAdminProducts();
    fireEvent.click(screen.getAllByText("Delete")[0]);
    expect(mockDeleteMutation.mutate).not.toHaveBeenCalled();
  });

  it("shows Deleting... when mutation is pending", () => {
    mockDeleteMutation.isPending = true;
    renderAdminProducts();
    const deletingButtons = screen.getAllByText("Deleting...");
    expect(deletingButtons.length).toBe(2);
  });

  it("shows empty row when no products", () => {
    mockProducts.data.data = [];
    renderAdminProducts();
    expect(screen.getByText("No products found.")).toBeInTheDocument();
  });

  it("shows spinner when loading", () => {
    mockProducts.isLoading = true;
    renderAdminProducts();
    expect(screen.getByText("Loading products...")).toBeInTheDocument();
  });

  it("shows error on failure", () => {
    mockProducts.isLoading = false;
    mockProducts.isError = true;
    mockProducts.error = new Error("Failed to load");
    renderAdminProducts();
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  it("shows pagination when multiple pages", () => {
    mockProducts.data.pagination = { page: 1, limit: 10, total: 20, totalPages: 2 };
    renderAdminProducts();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });
});
