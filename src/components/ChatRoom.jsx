import { useEffect, useRef, useState } from "react";
import { IoChatbubblesOutline } from "react-icons/io5";
import {
  FiSend,
  FiLogOut,
  FiUsers,
  FiSmile,
  FiPaperclip,
} from "react-icons/fi";
import { HiHashtag } from "react-icons/hi";
import SplitText from "./SplitText";

const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const ChatRoom = ({ username, room, socket, onLeave }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    socket.on("message", (msg) =>
      setMessages((prev) => [...prev, { ...msg, time: formatTime() }]),
    );
    return () => socket.off("message");
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit("send", { text: message, room, username });
    setMessages((prev) => [
      ...prev,
      { text: message, room, username, time: formatTime() },
    ]);
    setMessage("");
  };

  return (
    <div className="chatroom-wrapper">
      {/* UIverse rotating border card */}
      <div className="glow-card chatroom-container">
        <div className="glow-card-inner chatroom-inner">
          {/* ── Header ── */}
          <div className="chatroom-header">
            <div className="header-left">
              <div className="room-avatar">
                <HiHashtag color="#fff" size={18} />
              </div>
              <div className="room-info">
                <span className="room-name">{room}</span>
                <span className="room-status">
                  <span className="status-dot" /> Live
                </span>
              </div>
            </div>

            <div className="header-right">
              <button className="icon-btn" title="Members">
                <FiUsers size={15} />
              </button>
              <button className="leave-btn" onClick={onLeave}>
                <FiLogOut size={13} /> Leave
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <IoChatbubblesOutline className="chat-empty-icon" />
                <p>No messages yet — say hi!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isOwn = msg.username === username;
                const initials = (msg.username || "??")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div
                    key={idx}
                    className={`msg-row ${isOwn ? "own" : "other"}`}
                  >
                    <div className="msg-avatar-wrap">
                      <div
                        className={`msg-avatar ${isOwn ? "msg-own-avatar" : ""}`}
                      >
                        {initials}
                      </div>
                    </div>
                    <div className="msg-body">
                      <div className="msg-meta">
                        <span className="msg-username">
                          {isOwn ? "You" : msg.username}
                        </span>
                        <span className="msg-time">{msg.time}</span>
                      </div>
                      <div className="chat-bubble">
                        {isOwn ? (
                          msg.text
                        ) : (
                          <SplitText
                            text={msg.text}
                            delay={25}
                            duration={500}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Input ── */}
          <div className="chat-input-bar">
            <form className="chat-input-form" onSubmit={handleSend}>
              <button type="button" className="input-action-btn" tabIndex={-1}>
                <FiSmile />
              </button>
              <input
                className="chat-input"
                type="text"
                placeholder={`Message #${room}…`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                autoFocus
              />
              <button type="button" className="input-action-btn" tabIndex={-1}>
                <FiPaperclip />
              </button>
              <button
                className="send-btn"
                type="submit"
                disabled={!message.trim()}
                title="Send"
              >
                <FiSend size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
