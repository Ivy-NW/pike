import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("keeps only useful product, contact, and legal destinations", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: /terms of service/i })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: /contact/i })).toHaveAttribute("href", "mailto:hello@pike.app");
    expect(screen.getByRole("link", { name: /business login/i })).toHaveAttribute("href", "http://localhost:3001/login");
    expect(screen.queryByRole("link", { name: /careers/i })).not.toBeInTheDocument();
  });
});
