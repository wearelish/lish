export const statusLabel: Record<string, string> = {
  pending: "Pending Review",
  under_review: "Pending Review",
  price_sent: "Proposal Sent",
  in_progress: "In Progress",
  delivered: "Awaiting Final Payment",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
  accepted: "Accepted",
};

export const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  under_review: "bg-amber-100 text-amber-700",
  price_sent: "bg-blue-100 text-blue-700",
  in_progress: "bg-indigo-100 text-indigo-700",
  delivered: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-stone-100 text-stone-500",
};

export const StatusBadge = ({ status }: { status: string }) => (
  <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold ${statusColor[status] ?? "bg-muted text-muted-foreground"}`}>
    {statusLabel[status] ?? status.replace(/_/g, " ")}
  </span>
);

export const PageHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-8">
    <h1 className="font-serif text-3xl sm:text-4xl text-gradient">{title}</h1>
    {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
  </div>
);
