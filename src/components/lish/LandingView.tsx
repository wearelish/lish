import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, Rocket, Palette, Film, Globe, Layers, ShieldCheck, Zap, Users, Award, Heart, TrendingUp, ArrowRight, Star, CheckCircle2, Clock } from "lucide-react";

const services = [
  { icon: Code2, title: "Web Development", desc: "Full-stack web apps, SaaS platforms, and internal tools built to scale." },
  { icon: Rocket, title: "Mobile Apps", desc: "Cross-platform iOS & Android apps with React Native and Flutter." },
  { icon: Palette, title: "UI/UX Design", desc: "Premium interfaces, brand identities, and design systems that convert." },
  { icon: Film, title: "Video Editing", desc: "Professional video production, motion graphics, and content creation." },
  { icon: Globe, title: "Digital Marketing", desc: "SEO, social media, and growth strategies that drive real results." },
  { icon: Layers, title: "SaaS Products", desc: "From idea to launch — architecture, build, and ship full SaaS products." },
];

const portfolio = [
  { title: "FinTrack Pro", category: "SaaS · Web App", color: "from-blue-400 to-indigo-500", emoji: "📊" },
  { title: "StyleHouse", category: "E-commerce · Design", color: "from-rose-400 to-pink-500", emoji: "🛍️" },
  { title: "MediConnect", category: "Healthcare · Mobile", color: "from-emerald-400 to-teal-500", emoji: "🏥" },
  { title: "EduFlow LMS", category: "EdTech · Platform", color: "from-amber-400 to-orange-500", emoji: "🎓" },
  { title: "RealEstate360", category: "PropTech · Web", color: "from-purple-400 to-violet-500", emoji: "🏠" },
  { title: "LogiTrack", category: "Logistics · Mobile", color: "from-cyan-400 to-sky-500", emoji: "🚚" },
];

const whyUs = [
  { icon: Zap, title: "Fast Turnaround", desc: "We respond within 12–24 hours and deliver on time, every time." },
  { icon: ShieldCheck, title: "Zero Risk Payment", desc: "40% upfront, 60% on delivery. You only pay when satisfied." },
  { icon: Users, title: "Dedicated Team", desc: "A hand-picked team of specialists assigned to your project." },
  { icon: Award, title: "Premium Quality", desc: "Every deliverable goes through rigorous QA before reaching you." },
  { icon: Heart, title: "Client-First", desc: "Transparent communication and revisions until you love it." },
  { icon: TrendingUp, title: "Proven Results", desc: "100+ projects shipped with measurable business impact." },
];

const steps = [
  { n: "01", title: "Submit a Request", desc: "Share your idea, budget, and deadline in one simple form." },
  { n: "02", title: "Get a Proposal", desc: "Admin reviews and sends a detailed scope, timeline, and price." },
  { n: "03", title: "Accept & Pay 40%", desc: "Accept the proposal and pay the advance to kick off the project." },
  { n: "04", title: "Track Progress", desc: "Your assigned team builds it. Track status in real-time." },
  { n: "05", title: "Pay 60% & Download", desc: "Pay the remaining 60% on delivery and download your files." },
];

const testimonials = [
  { name: "Sarah M.", role: "Startup Founder", text: "Lish delivered our MVP in 3 weeks. Quality was exceptional and communication was seamless.", avatar: "SM" },
  { name: "James K.", role: "Product Manager", text: "The 40/60 payment model gave us confidence. We only paid in full after seeing the final product.", avatar: "JK" },
  { name: "Priya R.", role: "E-commerce Owner", text: "Our redesign increased conversions by 40%. Lish understood our brand perfectly.", avatar: "PR" },
];

export const LandingView = () => {
  const navigate = useNavigate();
  return (
    <div>
      {/* HERO */}
      <section className="relative pt-40 pb-24 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 border border-foreground/15 rounded-full px-4 py-1.5 text-xs font-medium mb-10 bg-white/50 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-widest uppercase text-foreground/60 text-[11px]">Now accepting new projects</span>
        </div>
        <h1 className="font-serif text-5xl sm:text-7xl font-semibold leading-[1.05] text-foreground">
          We Are <em className="not-italic text-gradient">LISH</em> —<br />building the future<br />with technology.
        </h1>
        <p className="mt-6 max-w-lg mx-auto text-base text-muted-foreground leading-relaxed">
          A premium digital agency delivering web development, mobile apps, UI/UX design, and video editing. Submit a request, get a proposal, watch your vision come to life.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={() => navigate("/signup")} className="rounded-full bg-foreground text-background hover:bg-foreground/85 border-0 px-8 h-12">
            Get Started <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="rounded-full h-12 px-8 border-foreground/20 bg-white/40 hover:bg-white/70">
            Sign in
          </Button>
        </div>
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[{ v: "100+", l: "Projects Shipped" }, { v: "48h", l: "Response Time" }, { v: "100%", l: "Remote Team" }, { v: "4.9★", l: "Client Rating" }].map(s => (
            <div key={s.l} className="glass-card rounded-2xl px-4 py-4 text-center">
              <div className="font-serif text-2xl font-semibold text-foreground">{s.v}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Services</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-2 text-gradient">Everything you need to ship.</h2>
          <p className="text-muted-foreground mt-2 text-sm max-w-lg">Web development, mobile apps, design, video editing, marketing, and SaaS — all under one roof.</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {services.map((s) => (
            <div key={s.title} className="glass-card rounded-3xl p-7 group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-pink-300 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg">{s.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Portfolio</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-2 text-gradient">Work we're proud of.</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {portfolio.map((p) => (
            <div key={p.title} className={`relative overflow-hidden rounded-3xl aspect-[4/3] bg-gradient-to-br ${p.color} group hover:scale-[1.02] transition-transform duration-300`}>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                <span className="text-5xl mb-3">{p.emoji}</span>
                <h3 className="font-serif text-xl font-semibold">{p.title}</h3>
                <p className="text-white/70 text-xs mt-1 uppercase tracking-wider">{p.category}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">About Lish</span>
            <h2 className="font-serif text-4xl sm:text-5xl mt-2 text-gradient leading-tight">A team built for the digital age.</h2>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">Lish is a fully remote digital agency founded on one principle: great work deserves a great process. We connect ambitious clients with a curated team of developers, designers, and creators who care deeply about craft.</p>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">Every project goes through a structured workflow — from proposal to delivery — with full transparency, clear milestones, and a payment model that protects you at every step.</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[{ v: "2024", l: "Founded" }, { v: "20+", l: "Experts" }, { v: "12+", l: "Countries" }, { v: "8+", l: "Industries" }].map(s => (
                <div key={s.l} className="glass-card rounded-2xl p-4">
                  <p className="font-serif text-2xl font-semibold">{s.v}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-pink-300 flex items-center justify-center text-white">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Our Mission</p>
                <p className="text-xs text-muted-foreground">Deliver excellence, always.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed italic">"We believe every business deserves access to world-class digital talent. Lish makes that possible — with a transparent process, fair pricing, and results you can measure."</p>
            <div className="border-t border-border mt-4 pt-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-pink-300 flex items-center justify-center text-white text-xs font-bold">L</div>
              <div>
                <p className="text-sm font-semibold">The Lish Team</p>
                <p className="text-xs text-muted-foreground">Founders & Core Team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="why" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Why Choose Us</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-2 text-gradient">Built different. Delivered better.</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {whyUs.map((w) => (
            <div key={w.title} className="glass-card rounded-3xl p-7">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <w.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-lg">{w.title}</h3>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">How It Works</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-2 text-gradient">A simple, transparent flow.</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="glass-card rounded-3xl p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center font-serif text-primary font-semibold mx-auto mb-4">{s.n}</div>
              <h3 className="font-serif text-base leading-snug">{s.title}</h3>
              <p className="text-muted-foreground text-xs mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Testimonials</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-2 text-gradient">Clients love working with us.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card rounded-3xl p-7">
              <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-pink-300 flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-accent opacity-50 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-secondary opacity-60 blur-3xl" />
          <div className="relative z-10">
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Get Started</span>
            <h3 className="font-serif text-3xl sm:text-5xl text-gradient mt-2">Ready to build something?</h3>
            <p className="text-muted-foreground mt-3 text-sm max-w-md mx-auto">Submit your first request in under 2 minutes. No commitment until you accept our proposal.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" onClick={() => navigate("/signup")} className="rounded-full bg-foreground text-background hover:bg-foreground/85 border-0 px-10 h-12">
                Request a Project <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="rounded-full h-12 px-8 border-foreground/20 bg-white/40 hover:bg-white/70">
                Sign in
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> Admin responds within 12–24 hours
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-8 border-t border-border">
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
    </div>
  );
};
