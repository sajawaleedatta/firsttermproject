import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../../components/Navbar";

const mockLogout = vi.fn();
const mockAuth = { user: null, logout: mockLogout, loading: false, token: null, login: vi.fn(), register: vi.fn() };

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
}

describe("Navbar", () => {
  beforeEach(() => {
    mockLogout.mockClear();
    mockAuth.user = null;
  });

  it("renders brand name", () => {
    renderNavbar();
    expect(screen.getByText("Deci Techno")).toBeInTheDocument();
  });

  it("shows login/register links when not authenticated", () => {
    renderNavbar();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("shows user name and logout when authenticated", () => {
    mockAuth.user = { id: "1", name: "John", email: "john@test.com", role: "CUSTOMER" };
    renderNavbar();
    expect(screen.getByText(/Hi, John/)).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });

  it("calls logout and navigates when logout clicked", () => {
    mockAuth.user = { id: "1", name: "John", email: "john@test.com", role: "CUSTOMER" };
    renderNavbar();
    fireEvent.click(screen.getByText("Logout"));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("shows customer links for CUSTOMER role", () => {
    mockAuth.user = { id: "1", name: "John", email: "john@test.com", role: "CUSTOMER" };
    renderNavbar();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });

  it("shows Dashboard link for ADMIN role", () => {
    mockAuth.user = { id: "1", name: "Admin", email: "admin@test.com", role: "ADMIN" };
    renderNavbar();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Products")).not.toBeInTheDocument();
    expect(screen.queryByText("Cart")).not.toBeInTheDocument();
  });
});
