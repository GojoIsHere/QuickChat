export const USERNAME_MAX_LENGTH = 24;
export const ROOM_MAX_LENGTH = 40;
export const MESSAGE_MAX_LENGTH = 1000;

export const validateJoinInput = (
  username: unknown,
  room: unknown
) => {
  if (
    typeof username !== "string" ||
    typeof room !== "string"
  ) {
    return {
      ok: false as const,
      error: "Username and room are required.",
    };
  }

  const cleanUsername = username.trim();
  const cleanRoom = room.trim().toLowerCase();

  if (!cleanUsername || !cleanRoom) {
    return {
      ok: false as const,
      error: "Username and room are required.",
    };
  }

  if (cleanUsername.length > USERNAME_MAX_LENGTH) {
    return {
      ok: false as const,
      error: `Username must be ${USERNAME_MAX_LENGTH} characters or less.`,
    };
  }

  if (cleanRoom.length > ROOM_MAX_LENGTH) {
    return {
      ok: false as const,
      error: `Room name must be ${ROOM_MAX_LENGTH} characters or less.`,
    };
  }

  if (!/^[a-z0-9-_]+$/.test(cleanRoom)) {
    return {
      ok: false as const,
      error:
        "Room names can only contain letters, numbers, hyphens, and underscores.",
    };
  }

  return {
    ok: true as const,
    username: cleanUsername,
    room: cleanRoom,
  };
};

export const validateMessage = (message: unknown) => {
  if (typeof message !== "string") {
    return {
      ok: false as const,
      error: "Message must be text.",
    };
  }

  const cleanMessage = message.trim();

  if (!cleanMessage) {
    return {
      ok: false as const,
      error: "Message cannot be empty.",
    };
  }

  if (cleanMessage.length > MESSAGE_MAX_LENGTH) {
    return {
      ok: false as const,
      error: `Messages must be ${MESSAGE_MAX_LENGTH} characters or less.`,
    };
  }

  return {
    ok: true as const,
    message: cleanMessage,
  };
};