import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppDownload } from "./AppDownload";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: {
    joinWaitlist: jest.fn(),
  },
}));

const mockedJoinWaitlist = api.joinWaitlist as jest.Mock;

describe("AppDownload", () => {
  beforeEach(() => {
    mockedJoinWaitlist.mockReset();
  });

  it("submits the email and shows the success state", async () => {
    mockedJoinWaitlist.mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();
    render(<AppDownload />);

    await user.type(screen.getByPlaceholderText("you@email.com"), "person@example.com");
    await user.click(screen.getByRole("button", { name: /join the player waitlist/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/on the list/i);
    expect(mockedJoinWaitlist).toHaveBeenCalledWith("person@example.com", "consumer");
  });

  it("disables the submit button while the request is in flight", async () => {
    let resolveRequest: (value: { ok: true }) => void;
    mockedJoinWaitlist.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<AppDownload />);

    await user.type(screen.getByPlaceholderText("you@email.com"), "person@example.com");
    await user.click(screen.getByRole("button", { name: /join the player waitlist/i }));

    const submitButton = await screen.findByRole("button", { name: /joining/i });
    expect(submitButton).toBeDisabled();

    resolveRequest!({ ok: true });
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/on the list/i));
  });

  it("shows an error message when the request fails", async () => {
    mockedJoinWaitlist.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();
    render(<AppDownload />);

    await user.type(screen.getByPlaceholderText("you@email.com"), "person@example.com");
    await user.click(screen.getByRole("button", { name: /join the player waitlist/i }));

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });
});
