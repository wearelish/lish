import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/lish/Navbar";
import { HeroIntro } from "@/components/lish/HeroIntro";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Code2, Rocket, MessagesSquare, ShieldCheck, Workflow } from "lucide-react";

const services = [
  { icon: Code2, title: "Custom Software", desc: "Bespoke web apps and internal tools, engineered to scale." },
  { icon: Rocket, title: "SaaS Products", desc: "From idea to launch — design, build, and ship full SaaS." },
  { icon: Sparkles, title: "Digital Experiences", desc: "Marketing sites, brands, and interactive experiences." },
];

const steps = [
  { icon: MessagesSquare, title: "Submit a request", desc: "Share your idea, budget and deadline in one form." },
  { icon: Workflow, title: "We negotiate & assign", desc: "Up to 3 friendly rounds, then we lock in the team." },
  { icon: ShieldCheck, title: "Build & deliver", desc: "40% upfront, track progress, 60% before delivery." },
];

const Index = () => {
  const [introDone, setIntroDone] = useState(
    typeof window !== "undefined" && sessionStorage.getItem("lish_intro") === "1"
  );
  const navigate = useNavigate();

  const finishIntro = () => {
    sessionStorage.setItem("lish_intro", "1");
    setIntroDone(true);
  };

  return (
    <div className="min-h-screen hero-bg relative overflow-x-hidden">
      {!introDone && <HeroIntro onDone={finishIntro} />}
      <Navbar />

      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full bg-[hsl(var(--accent))] opacity-50 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full bg-[hsl(var(--secondary))] opacity-60 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
      </div>

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: introDone ? 0 : 0.2 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          A modern digital workplace
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: introDone ? 0.05 : 0.3 }}
          className="font-serif text-5xl sm:text-7xl md:text-8xl font-semibold leading-[0.95] text-gradient"
        >
          We craft software<br />that feels intentional.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: introDone ? 0.2 : 0.6 }}
          className="mt-8 max-w-xl mx-auto text-lg text-muted-foreground"
        >
          LISH is where clients request, our team builds, and great products ship.
          One workflow — from first idea to launch day.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: introDone ? 0.35 : 0.9 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            size="lg"
            onClick={() => navigate("/signup")}
            className="rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground border-0 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] transition-all px-8 h-12"
          >
            Start a project <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/login")}
            className="rounded-full h-12 px-8 border-primary/30 hover:bg-white/60"
          >
            I already have an account
          </Button>
        </motion.div>

        {/* Floating cards preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { k: "Projects", v: "120+" },
            { k: "Clients", v: "60+" },
            { k: "Team", v: "18" },
            { k: "On-time", v: "98%" },
          ].map((s, i) => (
            <div key={s.k} className="glass rounded-3xl p-5 text-left animate-float" style={{ animationDelay: `${i * 0.4}s` }}>
              <div className="text-3xl font-serif font-semibold text-gradient">{s.v}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.k}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Services */}
      <section id="services" className="relative px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Services</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient">Everything you need to ship.</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass-strong rounded-3xl p-8 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] flex items-center justify-center text-primary-foreground shadow-[var(--shadow-soft)] group-hover:scale-110 transition-transform">
                <s.icon className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl mt-5">{s.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">How it works</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient">A simple, transparent flow.</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mt-14 relative">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass rounded-3xl p-8 relative"
            >
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-white shadow-[var(--shadow-soft)] flex items-center justify-center font-serif text-lg text-primary">
                {i + 1}
              </div>
              <s.icon className="w-7 h-7 text-primary" />
              <h3 className="font-serif text-xl mt-4">{s.title}</h3>
              <p className="text-muted-foreground text-sm mt-2">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 glass-strong rounded-3xl p-10 sm:p-14 text-center max-w-3xl mx-auto"
        >
          <h3 className="font-serif text-3xl sm:text-4xl text-gradient">Ready to build something?</h3>
          <p className="text-muted-foreground mt-3">Submit your first request in under a minute.</p>
          <Button
            size="lg"
            onClick={() => navigate("/signup")}
            className="mt-6 rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-primary-foreground border-0 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] px-8 h-12"
          >
            Get started <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </motion.div>
      </section>

      <footer className="relative px-6 py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LISH — A digital workplace.
      </footer>
    </div>
  );
};

export default Index;
