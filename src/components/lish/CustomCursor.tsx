import { useEffect, useRef, useState } from "react";

/**
 * CustomCursor — Liquid magnetic cursor system
 * - Smooth trailing dot + outer ring
 * - Magnetic pull on interactive elements
 * - Scales on hover, blends with glassmorphism theme
 * - Disabled on mobile / touch devices
 */
export const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    // Magnetic effect on interactive elements
    const MAGNETIC_SELECTORS = "a, button, [data-magnetic], input, textarea, select, label";
    const MAGNETIC_STRENGTH = 0.35;
    const MAGNETIC_RADIUS = 80;

    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as Element)?.closest(MAGNETIC_SELECTORS);
      if (target) setHovering(true);
    };
    const onMouseOut = (e: MouseEvent) => {
      const target = (e.target as Element)?.closest(MAGNETIC_SELECTORS);
      if (target) setHovering(false);
    };

    // Apply magnetic pull to elements
    const applyMagnetic = (e: MouseEvent) => {
      const elements = document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTORS);
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAGNETIC_RADIUS) {
          // Push-pull: attract when far, repel when very close
          const factor = dist < 20
            ? -MAGNETIC_STRENGTH * 0.5  // slight repulsion when very close
            : MAGNETIC_STRENGTH * (1 - dist / MAGNETIC_RADIUS); // attraction
          const moveX = -dx * factor;
          const moveY = -dy * factor;
          el.style.transform = `translate(${moveX}px, ${moveY}px)`;
          el.style.transition = "transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)";
        } else {
          el.style.transform = "";
          el.style.transition = "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)";
        }
      });
    };

    const resetMagnetic = () => {
      const elements = document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTORS);
      elements.forEach((el) => {
        el.style.transform = "";
        el.style.transition = "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)";
      });
    };

    // Animation loop — spring physics
    const DOT_EASE = 0.18;   // fast dot
    const RING_EASE = 0.09;  // slow trailing ring

    const animate = () => {
      // Dot follows mouse closely
      dotX += (mouseX - dotX) * (DOT_EASE + (clicking ? 0.1 : 0));
      dotY += (mouseY - dotY) * (DOT_EASE + (clicking ? 0.1 : 0));

      // Ring trails behind with spring
      ringX += (mouseX - ringX) * RING_EASE;
      ringY += (mouseY - ringY) * RING_EASE;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousemove", applyMagnetic);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);

    rafId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousemove", applyMagnetic);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      resetMagnetic();
      cancelAnimationFrame(rafId);
    };
  }, [visible, clicking]);

  // Don't render on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      {/* Outer trailing ring */}
      <div
        ref={ringRef}
        className="cursor-ring"
        style={{
          opacity: visible ? (hovering ? 1 : 0.6) : 0,
          width: hovering ? 52 : clicking ? 32 : 40,
          height: hovering ? 52 : clicking ? 32 : 40,
          marginLeft: hovering ? -6 : 0,
          marginTop: hovering ? -6 : 0,
        }}
      />
      {/* Inner dot */}
      <div
        ref={dotRef}
        className="cursor-dot"
        style={{
          opacity: visible ? 1 : 0,
          transform: clicking ? "scale(0.6)" : "scale(1)",
        }}
      />
    </>
  );
};
