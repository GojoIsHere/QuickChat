import { desc, eq } from "drizzle-orm";

import { db } from "./index.js";
import { messages, rooms } from "./schema.js";

// Retrieves a room by its slug, creating it if it doesn't exist
export const getOrCreateRoom = async (slug: string) => {
  const insertedRooms = await db
    .insert(rooms)
    .values({
      slug,
    })
    .onConflictDoNothing({
      target: rooms.slug,
    })
    .returning();

  // If we created a new room, return it
  if (insertedRooms.length > 0) {
    return insertedRooms[0];
  }

  // Otherwise the room already existed
  const existingRooms = await db
    .select()
    .from(rooms)
    .where(eq(rooms.slug, slug))
    .limit(1);

  return existingRooms[0];
};

// Retrieves the most recent messages for a given room, ordered from oldest to newest
export const getRecentMessages = async (
  roomId: string,
  limit = 50
) => {
  const recentMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.roomId, roomId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);

  // Database gives newest → oldest.
  // Chat UI wants oldest → newest.
  return recentMessages.reverse();
};

//Saves a new message to the database and returns the saved message
export const createMessage = async ({
  roomId,
  username,
  content,
}: {
  roomId: string;
  username: string;
  content: string;
}) => {
  const [savedMessage] = await db
    .insert(messages)
    .values({
      roomId,
      username,
      content,
    })
    .returning();

  return savedMessage;
};

