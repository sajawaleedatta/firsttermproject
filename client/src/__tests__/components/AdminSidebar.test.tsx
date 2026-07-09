import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";

function renderAdminSidebar(initialRoute = "/admin") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AdminSidebar />
    </MemoryRouter>
  );
}

describe("AdminSidebar", () => {
  it("renders admin panel heading", () => {
    renderAdminSidebar();
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    renderAdminSidebar();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Activity Logs")).toBeInTheDocument();
  });

  it("highlights active link for Dashboard at /admin", () => {
    renderAdminSidebar("/admin");
    expect(screen.getByText("Dashboard")).toHaveClass("active");
  });

  it("highlights active link for Products at /admin/products", () => {
    renderAdminSidebar("/admin/products");
    expect(screen.getByText("Products")).toHaveClass("active");
  });

  it("links have correct href attributes", () => {
    renderAdminSidebar();
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveAttribute("href", "/admin");

    const productsLink = screen.getByText("Products").closest("a");
    expect(productsLink).toHaveAttribute("href", "/admin/products");
  });
});
