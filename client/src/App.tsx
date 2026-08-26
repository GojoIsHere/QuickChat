import { useEffect, useState } from "react";
import { socket } from "./socket";

type Message = {
  id: string;
  socketId: string;
  message: string;
  createdAt: string;
};

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.connect();

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

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chat-message", handleMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chat-message", handleMessage);

      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    socket.emit("chat-message", trimmedMessage);

    setMessage("");
  };

  return (
    <main>
      <h1>QuickChat 💬</h1>

      <p>
        Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}
      </p>

      <div>
        {messages.map((item) => (
          <div key={item.id}>
            <strong>{item.socketId.slice(0, 6)}</strong>
            <p>{item.message}</p>
          </div>
        ))}
      </div>

      <input
        type="text"
        value={message}
        placeholder="Type a message..."
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            sendMessage();
          }
        }}
      />

      <button onClick={sendMessage}>
        Send
      </button>
    </main>
  );
}

export default App;