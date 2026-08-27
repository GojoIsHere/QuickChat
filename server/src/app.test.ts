import request from "supertest";
import {
  describe,
  expect,
  it,
} from "vitest";

import { createApp } from "./app.js";

describe("QuickChat API", () => {
  const app = createApp(
    "http://localhost:5173"
  );

  it("returns a healthy server response", async () => {
    const response = await request(app)
      .get("/health")
      .expect(200);

    expect(response.body).toEqual({
      status: "ok",
    });
  });
});