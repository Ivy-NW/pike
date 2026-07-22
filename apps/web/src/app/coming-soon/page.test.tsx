import { render, screen } from "@testing-library/react";
import ComingSoonPage from "./page";

describe("ComingSoonPage", () => {
  it("names the requested topic and links home", () => {
    render(<ComingSoonPage searchParams={{ topic: "Accessibility" }} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/accessibility.*coming soon/i);
    expect(screen.getByRole("link", { name: /back to the pike home page/i })).toHaveAttribute("href", "/");
  });
});
