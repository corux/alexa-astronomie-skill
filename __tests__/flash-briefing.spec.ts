import { handler } from "../src/flash-briefing";

describe("Handler", () => {
  it("should retrieve and parse data", async () => {
    const response = await handler(null, null, null);
    expect(response.titleText).toContain("Heute am Himmel");
    expect(response.mainText).toBeTruthy();
    expect(response.uid).toBeTruthy();
    expect(response.updateDate).toBeTruthy();
    expect(response.redirectionUrl).toBe("https://news.astronomie.info/hah");
  });
});
