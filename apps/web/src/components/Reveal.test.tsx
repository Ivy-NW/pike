import { act, fireEvent, render, screen } from "@testing-library/react";
import { Reveal } from "./Reveal";

describe("Reveal", () => {
  const originalObserver = global.IntersectionObserver;

  afterEach(() => {
    global.IntersectionObserver = originalObserver;
  });

  it("shows content when IntersectionObserver is unavailable", () => {
    // @ts-expect-error testing the progressive-enhancement fallback
    delete global.IntersectionObserver;
    render(<Reveal>Fallback content</Reveal>);
    expect(screen.getByText("Fallback content")).toHaveClass("is-visible");
  });

  it("reveals once when its shared observer reports an intersection", () => {
    let callback: IntersectionObserverCallback = () => undefined;
    const observe = jest.fn();
    const unobserve = jest.fn();
    const disconnect = jest.fn();
    global.IntersectionObserver = jest.fn((next: IntersectionObserverCallback) => {
      callback = next;
      return { observe, unobserve, disconnect } as unknown as IntersectionObserver;
    }) as unknown as typeof IntersectionObserver;

    render(<Reveal>Observed content</Reveal>);
    const wrapper = screen.getByText("Observed content");
    expect(wrapper).not.toHaveClass("is-visible");
    act(() => callback([{ isIntersecting: true, target: wrapper } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(wrapper).toHaveClass("is-visible");
    expect(unobserve).toHaveBeenCalledWith(wrapper);
  });

  it("never leaves focused controls visually pending", () => {
    let callback: IntersectionObserverCallback = () => undefined;
    global.IntersectionObserver = jest.fn((next: IntersectionObserverCallback) => {
      callback = next;
      return { observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() } as unknown as IntersectionObserver;
    }) as unknown as typeof IntersectionObserver;
    render(<Reveal><button>Use now</button></Reveal>);
    const button = screen.getByRole("button");
    fireEvent.focus(button);
    expect(button.closest(".scroll-reveal")).toHaveClass("is-visible");
    expect(callback).toBeDefined();
  });
});
