import {
  describe,
  expect,
  it,
} from "vitest";

import {
  validateJoinInput,
  validateMessage,
} from "./validation.js";

describe("join validation", () => {
  it("accepts valid username and room", () => {
    const result = validateJoinInput(
      "Sushil",
      "Developers"
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.username).toBe("Sushil");
      expect(result.room).toBe("developers");
    }
  });

  it("rejects usernames longer than 24 characters", () => {
    const result = validateJoinInput(
      "a".repeat(25),
      "developers"
    );

    expect(result.ok).toBe(false);
  });

  it("rejects invalid room names", () => {
    const result = validateJoinInput(
      "Sushil",
      "developers!!!"
    );

    expect(result.ok).toBe(false);
  });
});

describe("message validation", () => {
  it("rejects empty messages", () => {
    const result = validateMessage("     ");

    expect(result.ok).toBe(false);
  });

  it("rejects messages longer than 1000 characters", () => {
    const result = validateMessage(
      "a".repeat(1001)
    );

    expect(result.ok).toBe(false);
  });

  it("accepts and trims a valid message", () => {
    const result = validateMessage(
      "   hello bro   "
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.message).toBe("hello bro");
    }
  });
});