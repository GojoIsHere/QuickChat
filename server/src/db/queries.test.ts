import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import {
  afterAll,
  describe,
  expect,
  it,
} from "vitest";

import { db, pool } from "./index.js";
import {
  createMessage,
  getOrCreateRoom,
  getRecentMessages,
} from "./queries.js";
import { rooms } from "./schema.js";

describe("database queries", () => {
  const testRoomSlug =
    `test-${randomUUID().slice(0, 8)}`;

  let roomId: string | undefined;

  afterAll(async () => {
    if (roomId) {
      await db
        .delete(rooms)
        .where(eq(rooms.id, roomId));
    }

    await pool.end();
  });

  it("creates a room and persists its messages", async () => {
    const room =
      await getOrCreateRoom(testRoomSlug);

    roomId = room.id;

    expect(room.slug).toBe(testRoomSlug);

    // Calling it again should return
    // the same database room.
    const sameRoom =
      await getOrCreateRoom(testRoomSlug);

    expect(sameRoom.id).toBe(room.id);

    const message = await createMessage({
      roomId: room.id,
      username: "TestUser",
      content: "Database integration works!",
    });

    expect(message.username).toBe("TestUser");
    expect(message.content).toBe(
      "Database integration works!"
    );

    const history =
      await getRecentMessages(room.id);

    expect(
      history.some(
        (item) => item.id === message.id
      )
    ).toBe(true);
  });
});