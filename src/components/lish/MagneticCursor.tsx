import React, { useEffect, useRef, useState } from "react";

/**
 * LiquidMagneticCursor
 * Premium Apple-like cursor with:
 * - Custom circular cursor with pink glow
 * - Smooth trailing animation (spring easing)
 * - Magnetic pull on interactive elements
 * - Anti-gravity push-pull effect
 * - Disabled on mobile / touch devices
 * - requestAnimationFrame for 60fps
 */

const MAGNETIC_SELECTORS = "button, a, [data-magnetic], input, textarea, select, label[for]";
const MAGNETIC_STRENGTH = 0.35;   // 0–1, how strongly elements attract
const REPULSE_RADIUS = 28;        // px — when cursor is this close, repulse
const ATTRACT_RADIUS = 90;        // px — magnetic field radius
const CURSOR_LERP = 0.14;         // trailing lerp factor (lower = more lag)
const DOT_LERP = 0.28;            // inner dot lerp (faster)

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

export const MagneticCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -200, y: -200 });
  const cursorPos = useRef({ x: -200, y: -200 });
  const dotPos = useRef({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);
  const rafRef = useRef<number>(0);

  // Detect touch/mobile — disable cursor
  const isMobile = typeof window !== "undefined" &&
    (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);

  useEffect(() => {
    if (isMobile) return;

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);

    // Magnetic effect on interactive elements
    const applyMagnetic = () => {
      const els = document.querySelectorAll(MAGNETIC_SELECTORS);
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const d = dist(mouse.current.x, mouse.current.y, cx, cy);

        const htmlEl = el as HTMLElement;

        if (d < ATTRACT_RADIUS) {
          setHovering(true);
          const dx = mouse.current.x - cx;
          const dy = mouse.current.y - cy;
          const factor = d < REPULSE_RADIUS
            ? -MAGNETIC_STRENGTH * 0.6   // repulse when very close
            : MAGNETIC_STRENGTH * (1 - d / ATTRACT_RADIUS); // attract when far

          const mx = dx * factor;
          const my = dy * factor;

          htmlEl.style.transform = `translate(${mx.toFixed(2)}px, ${my.toFixed(2)}px)`;
          htmlEl.style.transition = "transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)";
        } else {
          htmlEl.style.transform = "";
          htmlEl.style.transition = "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)";
        }
      });

      // Check if any element is hovered
      const anyHovered = Array.from(els).some((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        return dist(mouse.current.x, mouse.current.y, cx, cy) < ATTRACT_RADIUS;
      });
      setHovering(anyHovered);
    };

    const animate = () => {
      // Lerp cursor ring
      cursorPos.current.x = lerp(cursorPos.current.x, mouse.current.x, CURSOR_LERP);
      cursorPos.current.y = lerp(cursorPos.current.y, mouse.current.y, CURSOR_LERP);

      // Lerp inner dot (faster)
      dotPos.current.x = lerp(dotPos.current.x, mouse.current.x, DOT_LERP);
      dotPos.current.y = lerp(dotPos.current.y, mouse.current.y, DOT_LERP);

      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate(${cursorPos.current.x}px, ${cursorPos.current.y}px) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${dotPos.current.x}px, ${dotPos.current.y}px) translate(-50%, -50%)`;
      }

      applyMagnetic();
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(rafRef.current);

      // Reset all magnetic transforms
      document.querySelectorAll(MAGNETIC_SELECTORS).forEach((el) => {
        (el as HTMLElement).style.transform = "";
        (el as HTMLElement).style.transition = "";
      });
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* Outer ring — trails behind */}
      <div
        ref={cursorRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: hovering ? 52 : clicking ? 28 : 40,
          height: hovering ? 52 : clicking ? 28 : 40,
          borderRadius: "50%",
          border: "1.5px solid hsl(350 55% 67% / 0.7)",
          background: hovering
            ? "hsl(350 55% 67% / 0.12)"
            : "hsl(350 55% 67% / 0.06)",
          boxShadow: hovering
            ? "0 0 24px 6px hsl(350 80% 80% / 0.35), 0 0 8px 2px hsl(350 55% 67% / 0.2)"
            : "0 0 16px 4px hsl(350 80% 80% / 0.2)",
          backdropFilter: "blur(2px)",
          pointerEvents: "none",
          zIndex: 99999,
          opacity: visible ? 1 : 0,
          transition: "width 0.25s cubic-bezier(0.23,1,0.32,1), height 0.25s cubic-bezier(0.23,1,0.32,1), opacity 0.3s, background 0.2s, box-shadow 0.2s",
          willChange: "transform",
        }}
      />

      {/* Inner dot — snappier */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: clicking ? 6 : 8,
          height: clicking ? 6 : 8,
          borderRadius: "50%",
          background: "linear-gradient(135deg, hsl(350 55% 67%), hsl(351 100% 80%))",
          boxShadow: "0 0 8px 2px hsl(350 80% 80% / 0.6)",
          pointerEvents: "none",
          zIndex: 100000,
          opacity: visible ? 1 : 0,
          transition: "width 0.15s, height 0.15s, opacity 0.3s",
          willChange: "transform",
        }}
      />
    </>
  );
};
