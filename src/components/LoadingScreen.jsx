import "./LoadingScreen.css";
import { IoChatbubblesOutline } from "react-icons/io5";

export default function LoadingScreen() {
  return (
    <div className="ls-overlay">
      {/* Ambient blobs */}
      <div className="ls-blob ls-blob1" />
      <div className="ls-blob ls-blob2" />

      <div className="ls-content">
        {/* Logo */}
        <div className="ls-logo">
          <IoChatbubblesOutline size={32} color="#fff" />
        </div>

        {/* Brand name */}
        <h1 className="ls-brand">NexChat</h1>
        <p className="ls-sub">Connecting you in real-time</p>

        {/* Animated bar */}
        <div className="ls-bar-track">
          <div className="ls-bar-fill" />
        </div>

        {/* Dots */}
        <div className="ls-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
