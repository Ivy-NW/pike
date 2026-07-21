import { render, screen } from "@testing-library/react";
import HomePage from "./page";

jest.mock("@/lib/api", () => ({ api: { joinWaitlist: jest.fn(), verifyAdminGate: jest.fn() }, ApiError: class ApiError extends Error {} }));

describe("HomePage", () => {
  it("renders the revised landing sections, footer, and waitlist", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1, name: /make every visit worth coming back for/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /look what i unlocked/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /make “see you again” part of the experience/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/your email address/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /legal & safety/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cookie policy/i })).toHaveAttribute("href", "/coming-soon?topic=Cookie%20Policy");
    expect(screen.getByText(/© \d{4} pike/i)).toBeInTheDocument();
  });
});
