import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Rocket, Sparkles, MessagesSquare, Workflow, ShieldCheck } from "lucide-react";

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

const stats = [
  { value: "100%", label: "REMOTE" },
  { value: "3", label: "PRODUCTS" },
  { value: "48h", label: "RESPONSE TIME" },
  { value: "◆", label: "PAID PER PROJECT" },
];

export const LandingView = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Hero */}
      <section className="relative pt-44 pb-24 px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 border border-foreground/15 rounded-full px-4 py-1.5 text-xs font-medium mb-10 bg-white/50 backdrop-blur-sm"
        >
          <span className="text-foreground/40 text-[10px]">»</span>
          <span className="tracking-widest uppercase text-foreground/60 text-[11px]">Now Hiring — 100% Remote</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-5xl sm:text-7xl md:text-[5.5rem] font-semibold leading-[1.05] text-foreground"
        >
          We are <em className="not-italic text-gradient">LISH</em> —<br />
          building the future<br />
          with technology.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-7 max-w-md mx-auto text-base text-muted-foreground leading-relaxed"
        >
          A growing tech organization hiring remote developers worldwide.<br />
          Ship real products. Earn real pay. From anywhere.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-12 inline-grid grid-cols-2 sm:grid-cols-4 divide-x divide-border glass-strong rounded-2xl overflow-hidden max-w-2xl w-full text-left"
        >
          {stats.map((s) => (
            <div key={s.label} className="px-5 py-5">
              <div className="font-serif text-2xl font-semibold text-foreground">{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            size="lg"
            onClick={() => navigate("/signup")}
            className="rounded-full bg-foreground text-background hover:bg-foreground/85 border-0 px-8 h-12 text-sm font-medium"
          >
            Apply for a role
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/login")}
            className="rounded-full h-12 px-8 border-foreground/20 bg-white/40 hover:bg-white/70 text-sm font-medium"
          >
            Sign in
          </Button>
        </motion.div>
      </section>

      {/* Services */}
      <section id="services" className="relative px-6 py-24 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Services</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient">Everything you need to ship.</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-strong rounded-3xl p-8 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] flex items-center justify-center text-white shadow-[var(--shadow-soft)] group-hover:scale-110 transition-transform">
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl mt-5">{s.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative px-6 py-24 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">How it works</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient">A simple, transparent flow.</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 mt-14">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass rounded-3xl p-8 relative"
            >
              <div className="absolute -top-4 -left-4 w-9 h-9 rounded-full bg-white shadow-[var(--shadow-soft)] flex items-center justify-center font-serif text-base text-primary font-semibold">
                {i + 1}
              </div>
              <s.icon className="w-6 h-6 text-primary" />
              <h3 className="font-serif text-xl mt-4">{s.title}</h3>
              <p className="text-muted-foreground text-sm mt-2">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 glass-strong rounded-3xl p-10 sm:p-14 text-center max-w-3xl mx-auto"
        >
          <h3 className="font-serif text-3xl sm:text-4xl text-gradient">Ready to build something?</h3>
          <p className="text-muted-foreground mt-3 text-sm">Submit your first request in under a minute.</p>
          <Button
            size="lg"
            onClick={() => navigate("/signup")}
            className="mt-6 rounded-full bg-foreground text-background hover:bg-foreground/85 border-0 px-8 h-12"
          >
            Get started <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </motion.div>
      </section>

      <footer className="relative px-6 py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LISH — A digital workplace.
      </footer>
    </>
  );
};
