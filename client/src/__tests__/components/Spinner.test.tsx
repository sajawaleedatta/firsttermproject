import { render, screen } from "@testing-library/react";
import Spinner from "../../components/Spinner";

describe("Spinner", () => {
  it("renders spinner element", () => {
    render(<Spinner />);
    expect(document.querySelector(".spinner")).toBeInTheDocument();
    expect(document.querySelector(".spinner-anim")).toBeInTheDocument();
  });

  it("renders default size (md)", () => {
    render(<Spinner />);
    expect(document.querySelector(".spinner")).toHaveClass("spinner-md");
  });

  it("renders with custom size", () => {
    render(<Spinner size="lg" />);
    expect(document.querySelector(".spinner")).toHaveClass("spinner-lg");
  });

  it("renders text when provided", () => {
    render(<Spinner text="Loading..." />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("does not render text when not provided", () => {
    render(<Spinner />);
    expect(document.querySelector(".spinner-text")).not.toBeInTheDocument();
  });
});
