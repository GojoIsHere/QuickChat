import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { socket } from "./socket";

type Message = {
  id: string;
  type: "chat" | "system";
  username?: string;
  socketId?: string;
  message: string;
  createdAt: string;
};

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");

  const [joined, setJoined] = useState(false);
  const [connected, setConnected] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const leaveRoom = () => {
  socket.emit("stop-typing");

  socket.emit("leave-room", () => {
    socket.disconnect();

    setJoined(false);
    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);
    setMessage("");
    });
  };

  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleMessage = (newMessage: Message) => {
      setMessages((previousMessages) => [
        ...previousMessages,
        newMessage,
      ]);
    };

    const handleRoomUsers = (users: string[]) => {
      setOnlineUsers(users);
    };

    const handleUserTyping = (typingUsername: string) => {
    setTypingUsers((previousUsers) => {
      if (previousUsers.includes(typingUsername)) {
        return previousUsers;
      }

      return [...previousUsers, typingUsername];
    });
  };

  const handleUserStopTyping = (typingUsername: string) => {
    setTypingUsers((previousUsers) =>
      previousUsers.filter(
        (user) => user !== typingUsername
      )
    );
  };

    socket.on("room-users", handleRoomUsers);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chat-message", handleMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chat-message", handleMessage);
      socket.off("room-users", handleRoomUsers);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
    };
  }, []);

  const joinRoom = (event: FormEvent) => {
    event.preventDefault();

    const cleanUsername = username.trim();
    const cleanRoom = room.trim();

    if (!cleanUsername || !cleanRoom) return;

    socket.connect();

    socket.emit("join-room", {
      username: cleanUsername,
      room: cleanRoom,
    });

    setJoined(true);
  };

  const handleTyping = (value: string) => {
  setMessage(value);

  if (!value.trim()) {
    socket.emit("stop-typing");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    return;
  }

  socket.emit("typing");

  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  typingTimeoutRef.current = setTimeout(() => {
    socket.emit("stop-typing");
  }, 1200);
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage) return;

    socket.emit("chat-message", cleanMessage);

    socket.emit("stop-typing");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setMessage("");
  };


  if (!joined) {
    return (
      <main>
        <h1>QuickChat 💬</h1>

        <p>Join a room and start chatting.</p>

        <form onSubmit={joinRoom}>
          <div>
            <label htmlFor="username">Username</label>

            <input
              id="username"
              type="text"
              placeholder="Gojo"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
            />
          </div>

          <div>
            <label htmlFor="room">Room</label>

            <input
              id="room"
              type="text"
              placeholder="developers"
              value={room}
              onChange={(event) =>
                setRoom(event.target.value)
              }
            />
          </div>

          <button type="submit">
            Join Chat
          </button>
        </form>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>QuickChat 💬</h1>

        <p>
          Room: <strong>#{room}</strong>
        </p>

        <p>
          {connected
            ? "🟢 Connected"
            : "🔴 Disconnected"}
        </p>
        <button onClick={leaveRoom}>
          Leave Room
        </button>
      </header>
      <aside>
          <h3>Online — {onlineUsers.length}</h3>
          <ul>
            {onlineUsers.map((user, index) => (
              <li key={`${user}-${index}`}>
                🟢 {user}
              </li>
            ))}
          </ul>
        </aside>
      <section>
        {messages.map((item) => {
          if (item.type === "system") {
            return (
              <p key={item.id}>
                <em>{item.message}</em>
              </p>
            );
          }

          return (
            <article key={item.id}>
              <strong>{item.username}</strong>

              <p>{item.message}</p>

              <small>
                {new Date(
                  item.createdAt
                ).toLocaleTimeString()}
              </small>
            </article>
          );
        })}
      </section>
      <div>
            {typingUsers.length === 1 && (
              <p>
                <em>{typingUsers[0]} is typing...</em>
              </p>
            )}

            {typingUsers.length === 2 && (
              <p>
                <em>
                  {typingUsers[0]} and {typingUsers[1]} are typing...
                </em>
              </p>
            )}

            {typingUsers.length > 2 && (
              <p>
                <em>
                  Several people are typing...
                </em>
              </p>
            )}
          </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(event) =>
            handleTyping(event.target.value)
          }
        />

        <button type="submit">
          Send
        </button>
      </form>
    </main>
  );
}

export default App;