import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { socket } from "./socket";
import "./App.css";

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
    <main className="join-page">
      <section className="join-card">
        <div className="brand">
          <div className="brand-icon">Q</div>

          <div>
            <h1>QuickChat</h1>
            <p>Real-time conversations. No refresh required.</p>
          </div>
        </div>

        <form className="join-form" onSubmit={joinRoom}>
          <div className="form-group">
            <label htmlFor="username">Username</label>

            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="room">Room</label>

            <input
              id="room"
              type="text"
              placeholder="e.g. developers"
              value={room}
              onChange={(event) =>
                setRoom(event.target.value)
              }
            />
          </div>

          <button className="join-button" type="submit">
            Join conversation
          </button>
        </form>

        <p className="join-footer">
          Powered by React + Socket.IO
        </p>
      </section>
    </main>
  );
}

  return (
  <main className="chat-app">
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon small">Q</div>
        <h2>QuickChat</h2>
      </div>

      <div className="room-info">
        <span className="room-label">CURRENT ROOM</span>
        <h3>#{room}</h3>
      </div>

      <div className="online-section">
        <div className="online-heading">
          <span>ONLINE</span>
          <span>{onlineUsers.length}</span>
        </div>

        <ul className="online-list">
          {onlineUsers.map((user, index) => (
            <li key={`${user}-${index}`}>
              <span className="online-dot" />
              <span>{user}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        className="leave-button"
        onClick={leaveRoom}
      >
        Leave room
      </button>
    </aside>

    <section className="chat-panel">
      <header className="chat-header">
        <div>
          <h2>#{room}</h2>
          <p>
            {onlineUsers.length}{" "}
            {onlineUsers.length === 1 ? "member" : "members"} online
          </p>
        </div>

        <div
          className={
            connected
              ? "connection connected"
              : "connection disconnected"
          }
        >
          <span />
          {connected ? "Live" : "Disconnected"}
        </div>
      </header>

      <section className="messages">
        {messages.map((item) => {
          if (item.type === "system") {
            return (
              <div className="system-message" key={item.id}>
                {item.message}
              </div>
            );
          }

          const isMine = item.username === username;

          return (
            <article
              className={`message-row ${
                isMine ? "mine" : ""
              }`}
              key={item.id}
            >
              <div className="message-avatar">
                {item.username
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div className="message-content">
                <div className="message-meta">
                  <strong>
                    {isMine ? "You" : item.username}
                  </strong>

                  <time>
                    {new Date(
                      item.createdAt
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>

                <div className="message-bubble">
                  {item.message}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <div className="typing-area">
        {typingUsers.length === 1 && (
          <span>{typingUsers[0]} is typing...</span>
        )}

        {typingUsers.length === 2 && (
          <span>
            {typingUsers[0]} and {typingUsers[1]} are typing...
          </span>
        )}

        {typingUsers.length > 2 && (
          <span>Several people are typing...</span>
        )}
      </div>

      <form
        className="message-composer"
        onSubmit={sendMessage}
      >
        <input
          type="text"
          placeholder={`Message #${room}`}
          value={message}
          onChange={(event) =>
            handleTyping(event.target.value)
          }
        />

        <button type="submit">
          Send
        </button>
      </form>
    </section>
  </main>
);
}
export default App;