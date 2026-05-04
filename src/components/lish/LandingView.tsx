import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Code2, Rocket, Sparkles, MessagesSquare, Workflow,
  ShieldCheck, Star, Globe, Layers, Palette, Film, CheckCircle2,
  Users, Award, Zap, Heart, Clock, TrendingUp
} from "lucide-react";

/* ─── Data ─────────────────────────────────────────────────────────────── */

const services = [
  { icon: Code2,    title: "Web Development",   desc: "Full-stack web apps, SaaS platforms, and internal tools engineered to scale." },
  { icon: Rocket,   title: "Mobile Apps",        desc: "Cross-platform iOS & Android apps built with React Native and Flutter." },
  { icon: Palette,  title: "UI/UX Design",       desc: "Premium interfaces, brand identities, and design systems that convert." },
  { icon: Film,     title: "Video Editing",      desc: "Professional video production, motion graphics, and content creation." },
  { icon: Globe,    title: "Digital Marketing",  desc: "SEO, social media, and growth strategies that drive real results." },
  { icon: Layers,   title: "SaaS Products",      desc: "From idea to launch — architecture, build, and ship full SaaS products." },
];

const portfolio = [
  { title: "FinTrack Pro",    category: "SaaS · Web App",    color: "from-blue-400 to-indigo-500",   emoji: "📊" },
  { title: "StyleHouse",      category: "E-commerce · Design", color: "from-rose-400 to-pink-500",   emoji: "🛍️" },
  { title: "MediConnect",     category: "Healthcare · Mobile", color: "from-emerald-400 to-teal-500", emoji: "🏥" },
  { title: "EduFlow LMS",     category: "EdTech · Platform",  color: "from-amber-400 to-orange-500", emoji: "🎓" },
  { title: "RealEstate360",   category: "PropTech · Web",     color: "from-purple-400 to-violet-500", emoji: "🏠" },
  { title: "LogiTrack",       category: "Logistics · Mobile", color: "from-cyan-400 to-sky-500",     emoji: "🚚" },
];

const whyUs = [
  { icon: Zap,        title: "Fast Turnaround",    desc: "We respond within 12–24 hours and deliver on time, every time." },
  { icon: ShieldCheck, title: "Zero Risk Payment", desc: "40% upfront, 60% on delivery. You only pay when you're satisfied." },
  { icon: Users,      title: "Dedicated Team",     desc: "A hand-picked team of specialists assigned to your project." },
  { icon: Award,      title: "Premium Quality",    desc: "Every deliverable goes through rigorous QA before reaching you." },
  { icon: Heart,      title: "Client-First",       desc: "Transparent communication and unlimited revisions until you love it." },
  { icon: TrendingUp, title: "Proven Results",     desc: "100+ projects shipped with measurable business impact." },
];

const steps = [
  { icon: MessagesSquare, title: "Submit a Request",    desc: "Share your idea, budget, and deadline in one simple form. Takes under 2 minutes." },
  { icon: Workflow,       title: "Review & Proposal",   desc: "Admin reviews your request and sends a detailed scope, timeline, and final price." },
  { icon: CheckCircle2,   title: "Accept & Pay 40%",    desc: "Accept the proposal and pay the 40% advance to kick off the project." },
  { icon: Rocket,         title: "Build & Deliver",     desc: "Your assigned team builds the project. Track progress in real-time." },
  { icon: ShieldCheck,    title: "Pay 60% & Download",  desc: "Pay the remaining 60% on delivery and download your final files." },
];

const stats = [
  { value: "100+", label: "Projects Shipped" },
  { value: "48h",  label: "Avg Response Time" },
  { value: "100%", label: "Remote Team" },
  { value: "4.9★", label: "Client Rating" },
];

const testimonials = [
  { name: "Sarah M.",    role: "Startup Founder",    text: "Lish delivered our MVP in 3 weeks. The quality was exceptional and communication was seamless throughout.", avatar: "SM" },
  { name: "James K.",    role: "Product Manager",    text: "The 40/60 payment model gave us confidence. We only paid the full amount after seeing the final product.", avatar: "JK" },
  { name: "Priya R.",    role: "E-commerce Owner",   text: "Our Shopify redesign increased conversions by 40%. Lish understood our brand perfectly.", avatar: "PR" },
];

/* ─── Sub-components ───────────────────────────────────────────────────── */

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">{children}</span>
);

const GlassCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={`glass-strong rounded-3xl ${className}`}
  >
    {children}
  </motion.div>
);

/* ─── Main Component ───────────────────────────────────────────────────── */

export const LandingView = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative pt-44 pb-28 px-6 max-w-5xl mx-auto text-center overflow-hidden">
        <motion.div style={{ y: heroY }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 border border-foreground/15 rounded-full px-4 py-1.5 text-xs font-medium mb-10 bg-white/50 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-widest uppercase text-foreground/60 text-[11px]">Now accepting new projects</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-5xl sm:text-7xl md:text-[5.5rem] font-semibold leading-[1.05] text-foreground"
          >
            We Are <em className="not-italic text-gradient">LISH</em> —<br />
            building the future<br />
            with technology.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-7 max-w-lg mx-auto text-base text-muted-foreground leading-relaxed"
          >
            A premium digital agency delivering web development, mobile apps, design, and video editing.
            Submit a request, get a proposal, and watch your vision come to life.
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
              Request a Project <ArrowRight className="ml-1 w-4 h-4" />
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
        </motion.div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────── */}
      <section id="services" className="relative px-6 py-24 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mb-12">
          <SectionLabel>Services</SectionLabel>
          <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient">Everything you need to ship.</h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            From concept to launch, we cover every digital discipline your business needs.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="glass-strong rounded-3xl p-8 group cursor-default"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] flex items-center justify-center text-white shadow-[var(--shadow-soft)] group-hover:scale-110 transition-transform duration-300">
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl mt-5">{s.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PORTFOLIO ────────────────────────────────────────────────── */}
      <section id="portfolio" className="relative px-6 py-24 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel>Portfolio</SectionLabel>
          <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient">Work we're proud of.</h2>
          <p className="text-muted-foreground mt-3 text-sm">A selection of projects we've shipped for clients worldwide.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {portfolio.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-3xl aspect-[4/3] cursor-default group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-90`} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                <span className="text-5xl mb-3">{p.emoji}</span>
                <h3 className="font-serif text-xl font-semibold">{p.title}</h3>
                <p className="text-white/70 text-xs mt-1 uppercase tracking-wider">{p.category}</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
          <Button onClick={() => navigate("/signup")} variant="outline"
            className="rounded-full h-11 px-8 border-foreground/20 bg-white/40 hover:bg-white/70 text-sm">
            Start your project <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </motion.div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────── */}
      <section id="about" className="relative px-6 py-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionLabel>About Lish</SectionLabel>
            <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient leading-tight">
              A team built for the digital age.
            </h2>
            <p className="text-muted-foreground mt-5 text-sm leading-relaxed">
              Lish is a fully remote digital agency founded on one principle: great work deserves great process.
              We connect ambitious clients with a curated team of developers, designers, and creators who care deeply about craft.
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              Every project goes through a structured workflow — from proposal to delivery — with full transparency,
              clear milestones, and a payment model that protects you at every step.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { label: "Founded", value: "2024" },
                { label: "Team Size", value: "20+ Experts" },
                { label: "Countries", value: "12+" },
                { label: "Industries", value: "8+" },
              ].map((item) => (
                <div key={item.label} className="glass-strong rounded-2xl p-4">
                  <p className="font-serif text-2xl font-semibold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
            className="relative">
            <div className="glass-strong rounded-3xl p-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] flex items-center justify-center text-white">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Our Mission</p>
                  <p className="text-xs text-muted-foreground">Deliver excellence, always.</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                "We believe every business deserves access to world-class digital talent.
                Lish makes that possible — with a transparent process, fair pricing, and results you can measure."
              </p>
              <div className="border-t border-border pt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] flex items-center justify-center text-white text-xs font-bold">L</div>
                <div>
                  <p className="text-sm font-semibold">The Lish Team</p>
                  <p className="text-xs text-muted-foreground">Founders & Core Team</p>
                </div>
              </div>
            </div>
            {/* Decorative blob */}
            <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-[hsl(var(--accent))] opacity-40 blur-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────────────────────────────── */}
      <section id="why" className="relative px-6 py-24 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel>Why Choose Us</SectionLabel>
          <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient">Built different. Delivered better.</h2>
          <p className="text-muted-foreground mt-3 text-sm">Six reasons why 100+ clients trust Lish with their most important projects.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {whyUs.map((w, i) => (
            <GlassCard key={w.title} className="p-7 group" delay={i * 0.07}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-[hsl(var(--primary-glow)/0.3)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <w.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-lg">{w.title}</h3>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{w.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="how" className="relative px-6 py-24 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel>How It Works</SectionLabel>
          <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient">A simple, transparent flow.</h2>
          <p className="text-muted-foreground mt-3 text-sm">Five steps from idea to delivered product — with zero surprises.</p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="grid md:grid-cols-5 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass rounded-3xl p-6 relative text-center"
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-[var(--shadow-soft)] flex items-center justify-center font-serif text-base text-primary font-semibold mx-auto mb-4 relative z-10">
                  {i + 1}
                </div>
                <s.icon className="w-5 h-5 text-primary mx-auto mb-3" />
                <h3 className="font-serif text-base leading-snug">{s.title}</h3>
                <p className="text-muted-foreground text-xs mt-2 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="relative px-6 py-24 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-14">
          <SectionLabel>Testimonials</SectionLabel>
          <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient">Clients love working with us.</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <GlassCard key={t.name} className="p-7" delay={i * 0.1}>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden"
        >
          <div aria-hidden className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[hsl(var(--accent))] opacity-50 blur-3xl" />
          <div aria-hidden className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[hsl(var(--secondary))] opacity-60 blur-3xl" />
          <div className="relative z-10">
            <SectionLabel>Get Started</SectionLabel>
            <h3 className="font-serif text-3xl sm:text-5xl text-gradient mt-3">Ready to build something?</h3>
            <p className="text-muted-foreground mt-4 text-sm max-w-md mx-auto">
              Submit your first request in under 2 minutes. No commitment until you accept our proposal.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/signup")}
                className="rounded-full bg-foreground text-background hover:bg-foreground/85 border-0 px-10 h-12 text-sm font-medium"
              >
                Request a Project <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login")}
                className="rounded-full h-12 px-8 border-foreground/20 bg-white/40 hover:bg-white/70 text-sm"
              >
                Sign in
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-5">
              <Clock className="w-3 h-3 inline mr-1" />
              Admin responds within 12–24 hours
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="relative px-6 py-10 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} LISH — A premium digital agency.</p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#services" className="hover:text-foreground transition-colors">Services</a>
            <a href="#portfolio" className="hover:text-foreground transition-colors">Portfolio</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          </div>
        </div>
      </footer>
    </>
  );
};
