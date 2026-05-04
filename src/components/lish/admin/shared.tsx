import React from "react";

export const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    under_review: "bg-amber-100 text-amber-700 border-amber-200",
    price_sent: "bg-blue-100 text-blue-700 border-blue-200",
    in_progress: "bg-indigo-100 text-indigo-700 border-indigo-200",
    delivered: "bg-purple-100 text-purple-700 border-purple-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    cancelled: "bg-stone-100 text-stone-500 border-stone-200",
    open: "bg-amber-100 text-amber-700 border-amber-200",
    resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    scheduled: "bg-blue-100 text-blue-700 border-blue-200",
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    todo: "bg-stone-100 text-stone-600 border-stone-200",
    done: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={`inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold border ${map[status] ?? "bg-stone-100 text-stone-500 border-stone-200"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
};

export const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div>
      <h1 className="text-xl font-bold text-stone-800">{title}</h1>
      {subtitle && <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const KpiCard = ({ icon: Icon, label, value, color = "rose" }: { icon: React.ElementType; label: string; value: string | number; color?: string }) => {
  const colors: Record<string, string> = { rose: "bg-rose-50 text-rose-500", blue: "bg-blue-50 text-blue-500", emerald: "bg-emerald-50 text-emerald-500", amber: "bg-amber-50 text-amber-500", indigo: "bg-indigo-50 text-indigo-500" };
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <div className={`w-9 h-9 rounded-xl ${colors[color] ?? colors.rose} flex items-center justify-center mb-3`}><Icon className="w-4 h-4" /></div>
      <p className="text-2xl font-bold text-stone-800">{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{label}</p>
    </div>
  );
};

export const Table = ({ headers, children, empty }: { headers: string[]; children?: React.ReactNode; empty?: boolean }) => (
  <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100 bg-stone-50">
            {headers.map(h => <th key={h} className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-stone-400 font-semibold whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {empty ? <tr><td colSpan={headers.length} className="px-4 py-12 text-center text-stone-400 text-sm">No records found.</td></tr> : children}
        </tbody>
      </table>
    </div>
  </div>
);

export const TR = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <tr onClick={onClick} className={`border-b border-stone-50 last:border-0 hover:bg-stone-50 transition-colors ${onClick ? "cursor-pointer" : ""}`}>{children}</tr>
);

export const TD = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-3 text-stone-700 ${className}`}>{children}</td>
);
