import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

describe("Header", () => {
  it("shows direct section links and both business paths", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /how it works/i })).toHaveAttribute("href", "#how-it-works");
    expect(screen.getByRole("link", { name: /for venues/i })).toHaveAttribute("href", "#for-venues");
    expect(screen.getByRole("link", { name: /quest examples/i })).toHaveAttribute("href", "#quest-examples");
    expect(screen.getByRole("link", { name: /business login/i })).toHaveAttribute("href", "http://localhost:3001/login");
    expect(screen.getByRole("link", { name: /create a venue quest/i })).toHaveAttribute("href", "http://localhost:3001/register");
  });
});
