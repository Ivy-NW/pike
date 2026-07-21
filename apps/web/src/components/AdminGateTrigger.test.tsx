import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminGateTrigger } from "./AdminGateTrigger";

jest.mock("@/lib/api", () => ({
  api: { verifyAdminGate: jest.fn() },
  ApiError: class ApiError extends Error {},
}));

describe("AdminGateTrigger", () => {
  it("does not render the modal until triggered", () => {
    render(
      <AdminGateTrigger>
        <span>© 2026 PIKE</span>
      </AdminGateTrigger>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the modal when the hidden trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AdminGateTrigger>
        <span>© 2026 PIKE</span>
      </AdminGateTrigger>,
    );

    await user.click(screen.getByText("© 2026 PIKE"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens the modal on Ctrl+Alt+A", async () => {
    render(
      <AdminGateTrigger>
        <span>© 2026 PIKE</span>
      </AdminGateTrigger>,
    );

    const user = userEvent.setup();
    await user.keyboard("{Control>}{Alt>}a{/Alt}{/Control}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
