"use client";

import { useRef, useState, useEffect } from "react";

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggle = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isPlaying) {
      vid.pause();
      vid.style.opacity = "0";
    } else {
      vid.play();
      vid.style.opacity = "1";
    }
    setIsPlaying(!isPlaying);
  };

  // Click anywhere to toggle
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") toggle();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isPlaying]);

  return (
    <>
      {/* Video layer */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="bg-video"
        style={{ opacity: 1, transition: "opacity 0.4s ease" }}
      >
        <source src="/ascii-bg.mp4" type="video/mp4" />
      </video>

      {/* Static image layer (hidden when video plays) */}
      <div
        className="bg-static"
        style={{
          opacity: isPlaying ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Toggle button */}
      <button
        className="bg-toggle-btn"
        onClick={toggle}
        title={`Switch to ${isPlaying ? "static" : "animated"} (press P)`}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>
    </>
  );
}
