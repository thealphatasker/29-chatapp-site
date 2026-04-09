import { useEffect, useState } from "react";
import ChatRoom from "./components/ChatRoom";
import ClickSpark from "./components/ClickSpark";
import Silk from "./components/Silk";
import "./App.css";
import { io } from "socket.io-client";
import { IoChatbubblesOutline } from "react-icons/io5";
import { FiUser, FiHash, FiArrowRight } from "react-icons/fi";

const SOCKET_URL = "http://localhost:5050";
let socket;

function App() {
  const [joined, setJoined] = useState(false);
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    socket = io(SOCKET_URL);
    socket.on("connect", () => console.log("Connected"));
    socket.on("disconnect", () => console.log("Disconnected"));
    return () => socket.disconnect();
  }, []);

  const handleLeave = () => {
    setUsername("");
    setRoom("");
    setJoined(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (socket) socket.emit("join", room);
    setJoined(true);
  };

  return (
    <>
      <Silk
        speed={4}
        scale={1.2}
        color="#1a0533"
        noiseIntensity={1.2}
        rotation={0}
      />

      <ClickSpark
        sparkColor="#a78bfa"
        sparkSize={12}
        sparkRadius={20}
        sparkCount={10}
        duration={500}
        extraScale={1.2}
      >
        {!joined ? (
          <div className="join-wrapper">
            {/* UIverse ElSombrero2 rotating conic-gradient border card */}
            <div className="glow-card join-card">
              <div className="glow-card-inner join-card-inner">
                {/* Brand */}
                <div className="join-brand">
                  <div className="join-brand-icon">
                    <IoChatbubblesOutline color="#fff" size={26} />
                  </div>
                  <span className="join-brand-name">NexChat</span>
                  <span className="join-brand-sub">Real-time messaging</span>
                </div>

                {/* Divider */}
                <div className="join-divider">
                  <span />
                  <p>Enter your details</p>
                  <span />
                </div>

                {/* Form */}
                <form className="join-form" onSubmit={handleSubmit}>
                  <div className="field-wrap">
                    <label className="field-label">Username</label>
                    <div className="field-input-row">
                      <FiUser className="field-icon" />
                      <input
                        className="join-input"
                        type="text"
                        placeholder="e.g. john_doe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="field-wrap">
                    <label className="field-label">Room</label>
                    <div className="field-input-row">
                      <FiHash className="field-icon" />
                      <input
                        className="join-input"
                        type="text"
                        placeholder="e.g. general"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button className="join-btn" type="submit">
                    Join Room <FiArrowRight />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <ChatRoom
            username={username}
            room={room}
            socket={socket}
            onLeave={handleLeave}
          />
        )}
      </ClickSpark>
    </>
  );
}

export default App;
