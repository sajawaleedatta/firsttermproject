import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../../pages/Login";

const mockLogin = vi.fn();
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
    user: null,
    token: null,
    login: mockLogin,
    loading: false,
  }),
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe("Login", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
    localStorage.clear();
  });

  it("renders login form", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows error when fields are empty", async () => {
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(screen.getByText("All fields are required.")).toBeInTheDocument();
  });

  it("calls login with credentials and navigates to home for CUSTOMER", async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    renderLogin();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test123" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@test.com", "test123");
    });
  });

  it("shows error message on failed login", async () => {
    const err = new Error("Invalid credentials") as Error & { response?: { data?: { error?: string } } };
    err.response = { data: { error: "Invalid email or password." } };
    mockLogin.mockRejectedValueOnce(err);

    renderLogin();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "wrong@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password.")).toBeInTheDocument();
    });
  });

  it("shows submitting state", async () => {
    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => { resolvePromise = resolve; });
    mockLogin.mockReturnValueOnce(promise);

    renderLogin();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test123" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText("Logging in...")).toBeInTheDocument();
    resolvePromise!();
  });

  it("has a link to register", () => {
    renderLogin();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });
});
