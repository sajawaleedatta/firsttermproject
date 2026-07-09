import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../../pages/Home";

const mockProducts = {
  data: {
    data: [
      {
        id: "1",
        name: "MacBook Pro",
        description: "Powerful laptop",
        price: 1999.99,
        images: ["/uploads/laptop.jpg"],
        category: "Laptops",
        stock: 10,
        userId: "admin-1",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "2",
        name: "iPhone 15",
        description: "Latest smartphone",
        price: 999.99,
        images: ["/uploads/iphone.jpg"],
        category: "Mobile",
        stock: 15,
        userId: "admin-1",
        createdAt: "2026-01-02T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
    ],
  },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock("../../hooks/useApi", () => ({
  useProducts: () => mockProducts,
}));

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

describe("Home", () => {
  beforeEach(() => {
    mockProducts.isLoading = false;
    mockProducts.isError = false;
    mockProducts.error = null;
    mockProducts.data.data = [
      { id: "1", name: "MacBook Pro", description: "Powerful laptop", price: 1999.99, images: ["/uploads/laptop.jpg"], category: "Laptops", stock: 10, userId: "admin-1", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
      { id: "2", name: "iPhone 15", description: "Latest smartphone", price: 999.99, images: ["/uploads/iphone.jpg"], category: "Mobile", stock: 15, userId: "admin-1", createdAt: "2026-01-02T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z" },
    ];
  });

  it("renders welcome heading", () => {
    renderHome();
    expect(screen.getByText("Welcome to Deci Techno")).toBeInTheDocument();
  });

  it("renders shop now and get started buttons", () => {
    renderHome();
    expect(screen.getByText("Shop Now")).toBeInTheDocument();
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("renders all four category cards", () => {
    renderHome();
    const categoryNames = document.querySelectorAll(".category-name");
    expect(categoryNames).toHaveLength(4);
    expect(categoryNames[0]).toHaveTextContent("Laptops");
    expect(categoryNames[1]).toHaveTextContent("Tablets");
    expect(categoryNames[2]).toHaveTextContent("Mobile");
    expect(categoryNames[3]).toHaveTextContent("Smart Watches");
  });

  it("renders latest products section heading", () => {
    renderHome();
    expect(screen.getByText("Latest Products")).toBeInTheDocument();
  });

  it("renders product cards from data", () => {
    renderHome();
    expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    expect(screen.getByText("iPhone 15")).toBeInTheDocument();
  });

  it("renders view all link", () => {
    renderHome();
    expect(screen.getByText("View All")).toBeInTheDocument();
  });

  it("shows spinner when loading", () => {
    mockProducts.isLoading = true;
    mockProducts.data.data = [];
    renderHome();
    expect(screen.getByText("Loading products...")).toBeInTheDocument();
  });

  it("shows error message on error", () => {
    mockProducts.isLoading = false;
    mockProducts.isError = true;
    mockProducts.error = new Error("Network error");
    renderHome();
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });
});
