import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Code2, Rocket, Sparkles, MessagesSquare, Workflow, ShieldCheck,
  Palette, Film, Globe, CheckCircle2, Star, Zap, Lock, HeartHandshake,
  Users, Award, Clock, TrendingUp, Send, FileText, CreditCard, Package
} from "lucide-react";

const services = [
  { icon: Code2, title: "Web Development", desc: "Bespoke web apps, dashboards, and internal tools engineered to scale with your business.", tag: "Full-Stack" },
  { icon: Rocket, title: "App Development", desc: "Native and cross-platform mobile apps — iOS, Android, and PWA — shipped fast.", tag: "Mobile" },
  { icon: Palette, title: "UI/UX Design", desc: "Premium interfaces with glassmorphism, motion design, and pixel-perfect execution.", tag: "Design" },
  { icon: Film, title: "Video Editing", desc: "Professional video production, motion graphics, and brand storytelling.", tag: "Creative" },
  { icon: Globe, title: "SaaS Products", desc: "From idea to launch — architecture, build, and ship full SaaS platforms.", tag: "Product" },
  { icon: Sparkles, title: "Digital Experiences", desc: "Marketing sites, interactive campaigns, and immersive brand experiences.", tag: "Marketing" },
];

const steps = [
  { icon: Send, step: "01", title: "Submit a Request", desc: "Fill out a simple form with your project description, budget, and deadline. Takes under 2 minutes.", color: "from-rose-400 to-pink-300" },
  { icon: MessagesSquare, step: "02", title: "Get a Proposal", desc: "Admin reviews your request within 12-24 hours and sends a detailed proposal with scope, timeline, and price.", color: "from-purple-400 to-violet-300" },
  { icon: CreditCard, step: "03", title: "Pay 40% to Start", desc: "Accept the proposal and pay a 40% advance. Work begins immediately after payment confirmation.", color: "from-blue-400 to-cyan-300" },
  { icon: Workflow, step: "04", title: "Track Progress", desc: "Monitor your project in real-time. Chat with the team, review updates, and preview files as they're built.", color: "from-amber-400 to-orange-300" },
  { icon: Package, step: "05", title: "Review Delivery", desc: "Receive your completed project. Review all files and deliverables before making the final payment.", color: "from-emerald-400 to-teal-300" },
  { icon: ShieldCheck, step: "06", title: "Pay 60% and Download", desc: "Pay the remaining 60% to unlock and download all final files. Project complete — zero risk.", color: "from-rose-400 to-pink-300" },
];

const portfolio = [
  { title: "FinTrack Dashboard", category: "Web App", desc: "Real-time financial analytics platform with AI insights.", gradient: "from-violet-200 to-purple-100", emoji: "📊" },
  { title: "Bloom E-Commerce", category: "Full-Stack", desc: "Premium fashion store with AR try-on feature.", gradient: "from-rose-200 to-pink-100", emoji: "🌸" },
  { title: "NovaMed App", category: "Mobile", desc: "Healthcare appointment booking for 50k+ patients.", gradient: "from-blue-200 to-cyan-100", emoji: "🏥" },
  { title: "Pulse Brand Identity", category: "Design", desc: "Complete rebrand for a Series-A startup.", gradient: "from-amber-200 to-orange-100", emoji: "✨" },
  { title: "CloudSync SaaS", category: "SaaS", desc: "B2B file management platform with team collaboration.", gradient: "from-emerald-200 to-teal-100", emoji: "☁️" },
  { title: "Reel Studio", category: "Video", desc: "Cinematic brand films for luxury lifestyle brands.", gradient: "from-fuchsia-200 to-pink-100", emoji: "🎬" },
];

const whyUs = [
  { icon: Zap, title: "12-24h Response", desc: "Every request gets a detailed proposal within one business day. No ghosting, ever.", color: "text-amber-500", bg: "bg-amber-50" },
  { icon: Lock, title: "Zero Financial Risk", desc: "Pay 40% to start, 60% only after you're satisfied. Files locked until full payment.", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: HeartHandshake, title: "Transparent Pricing", desc: "No hidden fees. Scope, timeline, and price agreed upfront before any work begins.", color: "text-rose-500", bg: "bg-rose-50" },
  { icon: Users, title: "Dedicated Team", desc: "A real team of developers, designers, and editors — not freelancers or agencies.", color: "text-purple-500", bg: "bg-purple-50" },
  { icon: Award, title: "Premium Quality", desc: "Every deliverable is reviewed by senior team members before it reaches you.", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: TrendingUp, title: "Real-Time Tracking", desc: "Live project dashboard with status updates, file previews, and direct messaging.", color: "text-indigo-500", bg: "bg-indigo-50" },
];

const testimonials = [
  { name: "Sarah K.", role: "Founder, Bloom Co.", text: "LISH delivered our e-commerce platform in 3 weeks. The quality was exceptional and communication was seamless throughout.", avatar: "SK", color: "bg-rose-100 text-rose-600" },
  { name: "Marcus T.", role: "CTO, FinTrack", text: "The dashboard they built handles 100k+ data points in real-time. Exactly what we needed, delivered on time.", avatar: "MT", color: "bg-blue-100 text-blue-600" },
  { name: "Priya M.", role: "CEO, NovaMed", text: "From concept to App Store in 6 weeks. The team understood our vision perfectly and executed flawlessly.", avatar: "PM", color: "bg-purple-100 text-purple-600" },
];

const stats = [
  { value: "50+", label: "PROJECTS SHIPPED" },
  { value: "12h", label: "AVG RESPONSE TIME" },
  { value: "100%", label: "REMOTE TEAM" },
  { value: "4.9 STAR", label: "CLIENT RATING" },
];

const techStack = ["React", "Next.js", "TypeScript", "Python", "Flutter", "Figma", "Supabase", "AWS", "Tailwind", "Framer Motion", "PostgreSQL", "Node.js"];

export const LandingView = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-rose-200/40 to-pink-100/20 blur-3xl float-slow" />
          <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-purple-100/30 to-rose-100/20 blur-3xl float-slow" style={{ animationDelay: "3s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-r from-pink-50/50 to-rose-50/50 blur-3xl" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 border border-foreground/15 rounded-full px-4 py-1.5 text-xs font-medium mb-10 bg-white/60 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-widest uppercase text-foreground/60 text-[11px]">Now Accepting Projects — 12h Response</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }}
            className="font-serif text-5xl sm:text-7xl md:text-[5.5rem] font-semibold leading-[1.05] text-foreground">
            We are <em className="not-italic text-gradient">LISH</em> —<br />
            <span className="text-foreground/70">building the future</span><br />
            with technology.
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-7 max-w-lg mx-auto text-base text-muted-foreground leading-relaxed">
            Premium web development, app design, and digital experiences — delivered by a dedicated remote team with full transparency and zero financial risk.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate("/signup")}
              className="rounded-full bg-foreground text-background hover:bg-foreground/85 border-0 px-8 h-12 text-sm font-medium gap-2 pulse-glow">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")}
              className="rounded-full h-12 px-8 border-foreground/20 bg-white/50 hover:bg-white/80 text-sm font-medium backdrop-blur-sm">
              Sign In
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.65 }}
            className="mt-14 inline-grid grid-cols-2 sm:grid-cols-4 divide-x divide-border glass-strong rounded-2xl overflow-hidden max-w-2xl w-full text-left">
            {stats.map((s) => (
              <div key={s.label} className="px-5 py-5">
                <div className="font-serif text-2xl font-semibold text-foreground">{s.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
        </motion.div>
      </section>

      {/* TECH MARQUEE */}
      <div className="relative py-6 overflow-hidden border-y border-border/50 bg-white/40 backdrop-blur-sm">
        <div className="flex gap-8 marquee-track whitespace-nowrap">
          {[...techStack, ...techStack].map((t, i) => (
            <span key={i} className="text-sm font-medium text-muted-foreground/60 tracking-wide shrink-0">
              {t} <span className="text-primary/40 mx-2">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <section id="services" className="relative px-6 py-28 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mb-14">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">What We Build</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient">Everything you need to ship.</h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            From concept to deployment — we handle the full stack so you can focus on your business.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="glass-strong rounded-3xl p-7 group cursor-pointer">
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] flex items-center justify-center text-white shadow-[var(--shadow-soft)] group-hover:scale-110 transition-transform duration-300">
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full bg-secondary text-primary">{s.tag}</span>
              </div>
              <h3 className="font-serif text-xl">{s.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" className="relative px-6 py-28 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Our Work</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient">Built with precision.</h2>
          <p className="text-muted-foreground mt-4 text-base">A selection of projects we have shipped for clients worldwide.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {portfolio.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.09 }}
              className="portfolio-card group cursor-pointer">
              <div className={`w-full aspect-video bg-gradient-to-br ${p.gradient} flex items-center justify-center text-5xl relative overflow-hidden`}>
                <span className="group-hover:scale-110 transition-transform duration-500">{p.emoji}</span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-foreground">{p.title}</h3>
                  <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-secondary text-primary">{p.category}</span>
                </div>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
          <Button variant="outline" onClick={() => navigate("/signup")}
            className="rounded-full h-11 px-7 border-foreground/20 bg-white/50 hover:bg-white/80 text-sm">
            Start Your Project <ArrowRight className="ml-1.5 w-4 h-4" />
          </Button>
        </motion.div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="why" className="relative px-6 py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Why LISH</span>
            <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient">Built different. Delivered better.</h2>
            <p className="text-muted-foreground mt-4 text-base">We are not an agency. We are a product team that works like a startup — fast, transparent, and obsessed with quality.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyUs.map((w, i) => (
              <motion.div key={w.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="why-card group">
                <div className={`w-11 h-11 rounded-2xl ${w.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <w.icon className={`w-5 h-5 ${w.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{w.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative px-6 py-28 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">About Us</span>
            <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient leading-tight">A team that ships, not just talks.</h2>
            <p className="text-muted-foreground mt-5 text-base leading-relaxed">
              LISH is a remote-first digital studio founded on one principle: <strong className="text-foreground">clients deserve real results, not promises.</strong>
            </p>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed">
              We are a tight-knit team of developers, designers, and creators who have shipped products for startups, enterprises, and everything in between. Every project gets a dedicated team, a clear scope, and a transparent timeline.
            </p>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed">
              Our payment model is built around trust: you pay 40% to start, and the remaining 60% only after you are satisfied with the delivery. Your files are locked until full payment — zero risk on both sides.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Remote-First", "Transparent Pricing", "Dedicated Teams", "Quality Guaranteed"].map(tag => (
                <span key={tag} className="text-xs font-medium px-3 py-1.5 rounded-full bg-secondary text-primary border border-primary/20">{tag}</span>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
            className="grid grid-cols-2 gap-4">
            {[
              { value: "50+", label: "Projects Shipped", icon: Package, color: "text-rose-500", bg: "bg-rose-50" },
              { value: "12h", label: "Avg Response Time", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
              { value: "100%", label: "Remote Team", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-50" },
              { value: "4.9", label: "Client Rating", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08 }}
                className="glass-strong rounded-2xl p-6 text-center">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-3`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="font-serif text-3xl font-semibold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative px-6 py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">The Process</span>
            <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient">Simple. Transparent. Safe.</h2>
            <p className="text-muted-foreground mt-4 text-base">Six clear steps from idea to delivery — with full visibility at every stage.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass rounded-3xl p-7 relative group hover:shadow-[var(--shadow-soft)] transition-shadow duration-300">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="absolute top-5 right-5 font-serif text-4xl font-bold text-foreground/5">{s.step}</div>
                <h3 className="font-serif text-lg font-semibold">{s.title}</h3>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-10 glass-strong rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6 max-w-3xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-300 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Zero Financial Risk Guarantee</h3>
              <p className="text-sm text-muted-foreground mt-1">Pay 40% to start work. Pay the remaining 60% only after reviewing the final delivery. Files are locked until full payment — protecting both parties.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative px-6 py-28 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Client Stories</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-gradient">Trusted by builders.</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-strong rounded-3xl p-7 flex flex-col gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold shrink-0`}>{t.avatar}</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative px-6 py-28 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="glass-strong rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-transparent to-purple-50/30 pointer-events-none" />
          <div className="relative">
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Get Started</span>
            <h3 className="font-serif text-3xl sm:text-5xl text-gradient mt-3">Ready to build something great?</h3>
            <p className="text-muted-foreground mt-4 text-base max-w-md mx-auto">
              Submit your first request in under 2 minutes. Get a detailed proposal within 12-24 hours.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" onClick={() => navigate("/signup")}
                className="rounded-full bg-foreground text-background hover:bg-foreground/85 border-0 px-10 h-12 text-sm font-medium gap-2">
                Request a Project <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")}
                className="rounded-full h-12 px-8 border-foreground/20 bg-white/50 hover:bg-white/80 text-sm">
                Sign In
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              {["No upfront commitment", "12-24h response", "Zero financial risk", "Cancel anytime"].map(f => (
                <span key={f} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {f}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative px-6 py-10 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl font-semibold text-gradient">LISH</span>
            <span className="text-xs text-muted-foreground">A premium digital studio.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#services" className="hover:text-foreground transition-colors">Services</a>
            <a href="#portfolio" className="hover:text-foreground transition-colors">Portfolio</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#how" className="hover:text-foreground transition-colors">How It Works</a>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} LISH. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};
