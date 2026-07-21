import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("keeps real routes and sends unfinished topics to the shared page", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: /terms of service/i })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: /contact/i })).toHaveAttribute("href", "mailto:hello@pike.app");
    expect(screen.getByRole("link", { name: /careers/i })).toHaveAttribute("href", "/coming-soon?topic=Careers");
  });
});
