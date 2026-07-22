import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminGateModal } from "./AdminGateModal";
import { api, ApiError } from "@/lib/api";

jest.mock("@/lib/api", () => {
  const actual = jest.requireActual("@/lib/api");
  return {
    ...actual,
    api: {
      verifyAdminGate: jest.fn(),
    },
  };
});

const mockedVerify = api.verifyAdminGate as jest.Mock;

describe("AdminGateModal", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    mockedVerify.mockReset();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "" },
    });
  });

  afterAll(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("redirects to the admin-gate route when the code is valid", async () => {
    mockedVerify.mockResolvedValueOnce({ valid: true });
    const user = userEvent.setup();
    render(<AdminGateModal onClose={jest.fn()} />);

    await user.type(screen.getByPlaceholderText("Access code"), "letmein");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(mockedVerify).toHaveBeenCalledWith("letmein");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(window.location.href).toBe("/api/admin-gate/redirect?code=letmein");
  });

  it("shows an invalid-code message when the code is wrong", async () => {
    mockedVerify.mockResolvedValueOnce({ valid: false });
    const user = userEvent.setup();
    render(<AdminGateModal onClose={jest.fn()} />);

    await user.type(screen.getByPlaceholderText("Access code"), "wrong");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByText(/invalid code/i)).toBeInTheDocument();
  });

  it("shows a rate-limited message on a 429 response", async () => {
    mockedVerify.mockRejectedValueOnce(new ApiError(429, "Too many requests"));
    const user = userEvent.setup();
    render(<AdminGateModal onClose={jest.fn()} />);

    await user.type(screen.getByPlaceholderText("Access code"), "wrong");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByText(/too many attempts/i)).toBeInTheDocument();
  });

  it("closes when clicking the backdrop but not the dialog content", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(<AdminGateModal onClose={onClose} />);

    await user.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
