/** @jest-environment node */
import { POST } from "./route";

describe("POST /api/free-marker", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) } as Response);
  });

  it("accepts a valid lead and forwards it to the API", async () => {
    const request = new Request("http://localhost/api/free-marker", { method: "POST", body: JSON.stringify({ name: "  Amina  ", venueName: "  Corner Cafe ", whatsapp: "+254 700 000 000" }) });
    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({ ok: true }));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/free-marker"), expect.objectContaining({ method: "POST" }));
  });

  it("rejects malformed input without reflecting it, and never calls the API", async () => {
    const response = await POST(new Request("http://localhost/api/free-marker", { method: "POST", body: JSON.stringify({ name: "A", venueName: "", whatsapp: "secret" }) }));
    expect(response.status).toBe(400);
    expect(JSON.stringify(await response.json())).not.toContain("secret");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns a generic error when the API is unreachable", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network down"));
    const response = await POST(new Request("http://localhost/api/free-marker", { method: "POST", body: JSON.stringify({ name: "Amina", venueName: "Corner Cafe", whatsapp: "+254 700 000 000" }) }));
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({ ok: false }));
  });
});
