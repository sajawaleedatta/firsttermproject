import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../../components/Footer";

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe("Footer", () => {
  it("renders brand name", () => {
    renderFooter();
    expect(screen.getByText("Deci Techno")).toBeInTheDocument();
  });

  it("renders category links", () => {
    renderFooter();
    expect(screen.getByText("Laptops")).toBeInTheDocument();
    expect(screen.getByText("Tablets")).toBeInTheDocument();
    expect(screen.getByText("Mobile")).toBeInTheDocument();
    expect(screen.getByText("Smart Watches")).toBeInTheDocument();
  });

  it("renders account links", () => {
    renderFooter();
    expect(screen.getByText("My Orders")).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
  });

  it("renders support info", () => {
    renderFooter();
    expect(screen.getByText("contact@ecommence.com")).toBeInTheDocument();
    expect(screen.getByText("1-800-555-0199")).toBeInTheDocument();
  });

  it("includes current year in copyright", () => {
    renderFooter();
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });
});
