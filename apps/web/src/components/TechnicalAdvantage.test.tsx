import { render, screen } from "@testing-library/react";
import { TechnicalAdvantage } from "./TechnicalAdvantage";

describe("TechnicalAdvantage", () => {
  it("renders all four feature tiles", () => {
    render(<TechnicalAdvantage />);
    expect(screen.getByText("Marker-based verification")).toBeInTheDocument();
    expect(screen.getByText("Venue analytics")).toBeInTheDocument();
    expect(screen.getByText("Zero-install WebAR")).toBeInTheDocument();
    expect(screen.getByText("Immutable proof of presence")).toBeInTheDocument();
  });
});
