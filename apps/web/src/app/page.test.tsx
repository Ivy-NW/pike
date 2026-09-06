import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import HomePage from "./page";

describe("verified-footfall landing page", () => {
  it("renders the nine required sections", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1, name: /every visit becomes proof/i })).toBeInTheDocument();
    expect(document.querySelectorAll("main > section")).toHaveLength(9);
    expect(screen.getByRole("heading", { name: /print it. they scan it/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /proof of presence looks like/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/example weekly report/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /running an event instead/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /make every visit worth coming back for/i })).toBeInTheDocument();
  });

  it("avoids auth links, an unverified live claim, and banned copy", () => {
    const { container } = render(<HomePage />);
    expect(screen.queryByText(/business login|create a business account/i)).not.toBeInTheDocument();
    const copy = container.textContent?.toLowerCase() ?? "";
    for (const word of ["engagement", "digital transformation", "loyalty programme", "seamless", "empower", "leverage", "immersive", "metaverse", "revolutionise", "revenue lift", "increased spend"]) expect(copy).not.toContain(word);
  });

  it("explains and switches the complete visit proof story", () => {
    render(<HomePage />);
    expect(screen.getByText("Point your camera at the PIKE marker.")).toBeInTheDocument();
    expect(screen.getByText("Presence verified at the venue.")).toBeInTheDocument();
    expect(screen.getByText("Return reward unlocked.")).toBeInTheDocument();

    const reward = screen.getByRole("button", { name: /03 reward/i });
    expect(reward).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(reward);
    expect(reward).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Reward earned")).toBeInTheDocument();
  });

  it("keeps cycling paused while either pointer or focus remains inside", () => {
    jest.useFakeTimers();
    const { unmount } = render(<HomePage />);
    const group = screen.getByRole("group", { name: /visit proof steps/i });
    const scan = screen.getByRole("button", { name: /01 scan/i });
    const visual = group.closest("figure");
    expect(visual).not.toBeNull();

    fireEvent.mouseEnter(visual!);
    act(() => scan.focus());
    fireEvent.mouseLeave(visual!);
    act(() => jest.advanceTimersByTime(3500));
    expect(scan).toHaveAttribute("aria-pressed", "true");

    unmount();
    jest.useRealTimers();
  });

  it("defers the demo video until the dialog opens and restores trigger focus", async () => {
    HTMLMediaElement.prototype.pause = jest.fn();
    render(<HomePage />);
    expect(document.querySelector("video")).not.toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: /watch the 1-minute demo/i });
    fireEvent.click(trigger);
    expect(await screen.findByRole("dialog", { name: /see a pike quest in motion/i })).toHaveAttribute("open");
    expect(document.querySelector("video source")).toHaveAttribute("src", "/pike-webar-demo-1min.mp4");

    fireEvent.click(screen.getByRole("button", { name: /close demo/i }));
    await waitFor(() => expect(document.querySelector("video")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("validates and submits the free marker form", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true } as Response);
    global.fetch = fetchMock;
    render(<HomePage />);
    const submit = screen.getByRole("button", { name: /request my free marker/i });
    fireEvent.click(submit);
    expect(await screen.findByText(/enter your name/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: "Amina" } });
    fireEvent.change(screen.getByLabelText(/venue name/i), { target: { value: "Corner Cafe" } });
    fireEvent.change(screen.getByLabelText(/whatsapp number/i), { target: { value: "+254 700 000 000" } });
    fireEvent.click(submit);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/free-marker", expect.objectContaining({ method: "POST" })));
    expect(await screen.findByText(/we’ll contact you/i)).toBeInTheDocument();
  });
});
