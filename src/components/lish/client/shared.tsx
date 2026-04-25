export const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    negotiating: "bg-purple-100 text-purple-700",
    accepted: "bg-blue-100 text-blue-700",
    in_progress: "bg-primary text-white",
    review: "bg-indigo-100 text-indigo-700",
    completed: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-muted text-muted-foreground",
    open: "bg-amber-100 text-amber-700",
    resolved: "bg-emerald-100 text-emerald-700",
    paid: "bg-emerald-100 text-emerald-700",
    unpaid: "bg-red-100 text-red-700",
    scheduled: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold shrink-0 ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
};

export const PageHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-8">
    <h1 className="font-serif text-3xl sm:text-4xl text-gradient">{title}</h1>
    {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
  </div>
);

export const EmptyState = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className="glass rounded-3xl p-14 text-center">
    <Icon className="w-10 h-10 text-primary/30 mx-auto mb-3" />
    <p className="text-muted-foreground text-sm">{text}</p>
  </div>
);
