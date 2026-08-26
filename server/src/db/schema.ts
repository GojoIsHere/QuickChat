import {
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  slug: varchar("slug", {
    length: 50,
  })
    .notNull()
    .unique(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

export const messages = pgTable(
  "messages",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, {
        onDelete: "cascade",
      }),

    username: varchar("username", {
      length: 32,
    }).notNull(),

    content: text("content")
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },

  (table) => [
    index("messages_room_created_idx").on(
      table.roomId,
      table.createdAt
    ),
  ]
);