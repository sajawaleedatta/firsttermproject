import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminAddProduct from "../../../pages/admin/AdminAddProduct";

const mockCreateMutation = { mutate: vi.fn(), isPending: false, isError: false, error: null };
let mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual as Record<string, unknown>,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../../hooks/useApi", () => ({
  useCreateProduct: () => mockCreateMutation,
}));

function renderAdminAddProduct() {
  return render(
    <MemoryRouter>
      <AdminAddProduct />
    </MemoryRouter>
  );
}

function getInputs(container: HTMLElement) {
  const inputs = container.querySelectorAll('input, textarea, select');
  return {
    name: inputs[0] as HTMLInputElement,
    description: inputs[1] as HTMLTextAreaElement,
    price: inputs[2] as HTMLInputElement,
    stock: inputs[3] as HTMLInputElement,
    category: inputs[4] as HTMLSelectElement,
    images: inputs[5] as HTMLInputElement,
  };
}

describe("AdminAddProduct", () => {
  beforeEach(() => {
    mockCreateMutation.mutate.mockReset();
    mockCreateMutation.isPending = false;
    mockCreateMutation.isError = false;
    mockCreateMutation.error = null;
    mockNavigate.mockReset();
  });

  it("renders add product heading", () => {
    renderAdminAddProduct();
    expect(screen.getByText("Add Product")).toBeInTheDocument();
  });

  it("renders form fields", () => {
    renderAdminAddProduct();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Price ($)")).toBeInTheDocument();
    expect(screen.getByText("Stock")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Images")).toBeInTheDocument();
  });

  it("renders category options", () => {
    renderAdminAddProduct();
    expect(screen.getByText("Laptops")).toBeInTheDocument();
    expect(screen.getByText("Tablets")).toBeInTheDocument();
    expect(screen.getByText("Mobile")).toBeInTheDocument();
    expect(screen.getByText("Smart Watches")).toBeInTheDocument();
  });

  it("renders submit and cancel buttons", () => {
    renderAdminAddProduct();
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("calls mutate with form data on submit", () => {
    const { container } = renderAdminAddProduct();
    const inputs = getInputs(container);
    fireEvent.change(inputs.name, { target: { value: "New Product" } });
    fireEvent.change(inputs.description, { target: { value: "A great product" } });
    fireEvent.change(inputs.price, { target: { value: "49.99" } });
    fireEvent.change(inputs.stock, { target: { value: "100" } });
    fireEvent.change(inputs.category, { target: { value: "Mobile" } });

    fireEvent.click(screen.getByText("Create Product"));

    expect(mockCreateMutation.mutate).toHaveBeenCalledTimes(1);
    const calledWith = mockCreateMutation.mutate.mock.calls[0][0];
    expect(calledWith).toBeInstanceOf(FormData);
    expect(calledWith.get("name")).toBe("New Product");
    expect(calledWith.get("description")).toBe("A great product");
    expect(calledWith.get("price")).toBe("49.99");
    expect(calledWith.get("stock")).toBe("100");
    expect(calledWith.get("category")).toBe("Mobile");
  });

  it("navigates to admin products on success", () => {
    mockCreateMutation.mutate.mockImplementation((_fd, { onSuccess }: { onSuccess?: () => void }) => {
      onSuccess?.();
    });

    const { container } = renderAdminAddProduct();
    const inputs = getInputs(container);
    fireEvent.change(inputs.name, { target: { value: "New Product" } });
    fireEvent.change(inputs.price, { target: { value: "10" } });
    fireEvent.change(inputs.stock, { target: { value: "5" } });
    fireEvent.click(screen.getByText("Create Product"));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/products");
  });

  it("shows Creating... when pending", () => {
    mockCreateMutation.isPending = true;
    renderAdminAddProduct();
    expect(screen.getByText("Creating...")).toBeInTheDocument();
  });

  it("shows error message on failure", () => {
    mockCreateMutation.isError = true;
    mockCreateMutation.error = new Error("Failed to create");
    renderAdminAddProduct();
    expect(screen.getByText("Failed to create")).toBeInTheDocument();
  });

  it("navigates back on cancel click", () => {
    renderAdminAddProduct();
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockNavigate).toHaveBeenCalledWith("/admin/products");
  });
});
