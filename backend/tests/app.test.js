const request = require("supertest");
const { app } = require("../server");

describe("API smoke tests", () => {
  it("returns API status", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("API is running");
  });

  it("returns 404 for unknown routes", async () => {
    const response = await request(app).get("/api/does-not-exist");
    expect(response.statusCode).toBe(404);
    expect(response.body.code).toBe("NOT_FOUND");
  });
});
