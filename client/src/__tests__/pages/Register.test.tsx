import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "../../pages/Register";

const mockRegister = vi.fn();
let mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual as Record<string, unknown>,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    register: mockRegister,
    loading: false,
  }),
}));

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
}

describe("Register", () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockNavigate.mockReset();
  });

  it("renders register form", () => {
    renderRegister();
    expect(screen.getByRole("heading", { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Register as")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("defaults to CUSTOMER role", () => {
    renderRegister();
    expect(screen.getByLabelText("Register as")).toHaveValue("CUSTOMER");
  });

  it("allows selecting ADMIN role", () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText("Register as"), { target: { value: "ADMIN" } });
    expect(screen.getByLabelText("Register as")).toHaveValue("ADMIN");
  });

  it("shows error when fields are empty", () => {
    renderRegister();
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(screen.getByText("All fields are required.")).toBeInTheDocument();
  });

  it("shows error when password is too short", () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "john@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "12345" } });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(screen.getByText("Password must be at least 6 characters.")).toBeInTheDocument();
  });

  it("calls register with valid data and navigates to home for CUSTOMER", async () => {
    mockRegister.mockResolvedValueOnce(undefined);

    renderRegister();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "john@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "john123" } });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith("John", "john@test.com", "john123", "CUSTOMER");
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("navigates to /admin when registering as ADMIN", async () => {
    mockRegister.mockResolvedValueOnce(undefined);

    renderRegister();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Admin" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "admin@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "admin123" } });
    fireEvent.change(screen.getByLabelText("Register as"), { target: { value: "ADMIN" } });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });
  });

  it("shows error message on failed registration", async () => {
    const err = new Error("Email already exists") as Error & { response?: { data?: { error?: string } } };
    err.response = { data: { error: "Email already in use." } };
    mockRegister.mockRejectedValueOnce(err);

    renderRegister();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "existing@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "john123" } });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText("Email already in use.")).toBeInTheDocument();
    });
  });

  it("shows submitting state", async () => {
    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => { resolvePromise = resolve; });
    mockRegister.mockReturnValueOnce(promise);

    renderRegister();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "john@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "john123" } });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(screen.getByText("Creating account...")).toBeInTheDocument();
    resolvePromise!();
  });

  it("has a link to login", () => {
    renderRegister();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});
