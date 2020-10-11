import { handler } from "../src/flash-briefing";

describe("Handler", () => {
  it("should retrieve empty array", async () => {
    const response = await handler(null, null, null);
    expect(response).toStrictEqual([]);
  });
});
