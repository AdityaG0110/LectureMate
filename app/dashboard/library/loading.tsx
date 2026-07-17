import { FileText } from "lucide-react";

export default function Loading() {
  return <div className="mx-auto max-w-5xl"><section className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/75 p-7 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[.03] sm:p-10"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><FileText size={23}/></span><div className="mt-6 h-8 w-40 animate-pulse rounded-lg bg-slate-200 dark:bg-white/10"/><div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-slate-100 dark:bg-white/5"/><div className="mt-8 space-y-2">{[1,2,3].map(item=><div key={item} className="h-20 animate-pulse rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-white/5"/>)}</div></section></div>;
}
