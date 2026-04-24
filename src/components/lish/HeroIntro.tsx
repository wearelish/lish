import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/** Cinematic full-screen intro: "We Are LISH" → fades into the site. */
export const HeroIntro = ({ onDone }: { onDone: () => void }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 2800);
    const t2 = setTimeout(onDone, 3400);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center hero-bg overflow-hidden"
        >
          {/* Animated blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[hsl(var(--accent))] opacity-60 blur-3xl animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] rounded-full bg-[hsl(var(--secondary))] opacity-60 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
          <div className="absolute top-1/2 right-1/3 w-72 h-72 rounded-full bg-[hsl(var(--primary-glow))] opacity-40 blur-3xl animate-blob" style={{ animationDelay: "6s" }} />

          {/* Particles */}
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
              initial={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                opacity: 0,
              }}
              animate={{ opacity: [0, 1, 0], y: "-=80" }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}

          <div className="text-center relative">
            <motion.h1
              initial={{ opacity: 0, y: 30, letterSpacing: "0.4em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "-0.04em" }}
              transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
              className="font-serif text-6xl sm:text-8xl md:text-[10rem] font-semibold text-gradient leading-none"
            >
              We Are LISH
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mt-6 text-base sm:text-lg text-muted-foreground"
            >
              We build digital experiences, SaaS, and software.
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};