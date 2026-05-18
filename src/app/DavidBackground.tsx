"use client";

import { useEffect, useRef } from "react";

export default function DavidBackground() {
  const lensRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const lens = lensRef.current;
    if (!lens) return;

    let mouseX = -200;
    let mouseY = -200;
    let targetX = -200;
    let targetY = -200;
    let currentX = -200;
    let currentY = -200;
    let glitchTimer = 0;

    const onMouse = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      targetX = mouseX - 100;
      targetY = mouseY - 100;
      lens.classList.add("glitch-lens--visible");
    };

    const onLeave = () => {
      lens.classList.remove("glitch-lens--visible");
    };

    const animate = () => {
      if (!lens) return;

      // Smooth follow
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      
      lens.style.left = `${currentX}px`;
      lens.style.top = `${currentY}px`;

      // Glitch effect based on speed
      const speed = Math.sqrt(
        (targetX - currentX) ** 2 + (targetY - currentY) ** 2
      );
      const intensity = Math.min(speed * 0.12, 25);

      if (intensity > 3) {
        glitchTimer += 1;
        if (glitchTimer % 3 === 0) {
          const glitchX = (Math.random() - 0.5) * intensity;
          const glitchY = (Math.random() - 0.5) * intensity;
          const rotate = (Math.random() - 0.5) * intensity * 0.2;
          lens.style.transform = `translate(${glitchX}px, ${glitchY}px) rotate(${rotate}deg)`;
          lens.style.width = `${200 + (Math.random() - 0.5) * intensity}px`;
          lens.style.height = `${200 + (Math.random() - 0.5) * intensity}px`;
        }
      } else {
        lens.style.transform = "";
        lens.style.width = "200px";
        lens.style.height = "200px";
        glitchTimer = 0;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMouse);
    document.addEventListener("mouseleave", onLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouse);
      document.removeEventListener("mouseleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={lensRef} className="glitch-lens" />
    </>
  );
}
