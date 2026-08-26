import { FormEvent, useEffect, useState } from "react";
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

    socket.on("room-users", handleRoomUsers);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chat-message", handleMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chat-message", handleMessage);
      socket.off("room-users", handleRoomUsers);
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

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage) return;

    socket.emit("chat-message", cleanMessage);

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

      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
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