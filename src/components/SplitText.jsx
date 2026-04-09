import { useEffect, useRef, useState } from "react";

const SplitText = ({ text, delay = 30, duration = 600, className = "" }) => {
  const [chars, setChars] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!text) return;
    // Split text into characters, preserving spaces
    const characters = text.split("").map((char, idx) => ({
      char: char === " " ? "\u00A0" : char, // non-breaking space
      key: idx,
    }));
    setChars(characters);
  }, [text]);

  return (
    <span ref={containerRef} className={`split-text ${className}`}>
      {chars.map((item, idx) => (
        <span
          key={item.key}
          className="split-char"
          style={{
            animationDelay: `${idx * delay}ms`,
            animationDuration: `${duration}ms`,
          }}
        >
          {item.char}
        </span>
      ))}
    </span>
  );
};

export default SplitText;
