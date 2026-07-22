import { render, screen } from "@testing-library/react";
import { SocialProofStrip } from "./SocialProofStrip";

describe("SocialProofStrip", () => {
  it("renders the eyebrow and category tags without naming fabricated customers", () => {
    render(<SocialProofStrip />);
    expect(screen.getByText(/built for venues like yours/i)).toBeInTheDocument();
    expect(screen.getByText("Cafés")).toBeInTheDocument();
    expect(screen.getByText("Gyms")).toBeInTheDocument();
  });
});
