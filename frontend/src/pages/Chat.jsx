import { useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "../api";
import styles from "./Chat.module.css";

export default function Chat() {
  const location = useLocation();
  const [messages, setMessages] = useState([]); // {role: 'user'|'bot', text: string}
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();
  const messagesEndRef = useRef();

  useEffect(() => {
    if (location.state && location.state.question) {
      setContext(location.state.question);
      setMessages([
        {
          role: "bot",
          text: `Let's discuss this question: ${location.state.question}`,
        },
      ]);
      setMessage("");
    }
    if (inputRef.current) inputRef.current.focus();
  }, [location.state]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const userMsg = message;
    // Prepare history (exclude current input)
    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setMessage("");
    try {
      const res = await api.post("/ai/chat", {
        quiz: {},
        user_message: userMsg,
        context,
        history,
      });
      setMessages((prev) => [...prev, { role: "bot", text: res.response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: err.message || "Chat failed" },
      ]);
      setError(err.message || "Chat failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.chatBg}>
      <div className={styles.chatCard}>
        <div className={styles.chatTitle}>AI Chat</div>
        {context && (
          <div className={styles.chatContext}>Discussing: {context}</div>
        )}
        <div className={styles.chatMessages}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={styles.messageRow}
              style={{
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                className={
                  msg.role === "user" ? styles.messageUser : styles.messageBot
                }
              >
                {/* Render bold for **word** in LLM output */}
                {msg.role === "bot" ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>"),
                    }}
                  />
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {error && <div className={styles.chatError}>{error}</div>}
        <form
          className={styles.chatForm}
          onSubmit={handleSend}
          autoComplete="off"
        >
          <input
            ref={inputRef}
            className={styles.chatInput}
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={loading}
          />
          <button
            className={styles.chatSendBtn}
            type="submit"
            disabled={loading || !message.trim()}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
