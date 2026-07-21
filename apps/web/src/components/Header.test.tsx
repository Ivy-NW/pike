import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./Header";

describe("Header", () => {
  it("uses one section menu and keeps business login out of navigation", async () => {
    const user = userEvent.setup(); render(<Header />);
    expect(screen.queryByRole("link", { name: /business login/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create your first quest/i })).toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: /how it works/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false"); await user.click(trigger); expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /for players/i })).toHaveAttribute("href", "#for-players");
    await user.keyboard("{Escape}"); expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
