"use client";

import { Download, FileText, LoaderCircle, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createMaterialDownloadUrl, deleteMaterial } from "@/app/actions/materials";
import type { Material } from "@/types/material";

function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }
function formatDate(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }

export function LibraryWorkspace({ materials, loadError = "" }: { materials: Material[]; loadError?: string }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string>();
  const [error, setError] = useState("");

  async function download(material: Material) {
    setBusyId(material.id); setError("");
    const result = await createMaterialDownloadUrl(material.id);
    setBusyId(undefined);
    if (result.error || !result.data) setError(result.error ?? "Unable to open the PDF.");
    else window.location.assign(result.data.url);
  }

  async function remove(material: Material) {
    if (!window.confirm(`Delete “${material.originalName}”? This cannot be undone.`)) return;
    setBusyId(material.id); setError("");
    const result = await deleteMaterial(material.id);
    setBusyId(undefined);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  return <div className="mx-auto max-w-5xl"><section className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/75 p-7 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[.03] sm:p-10"><div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-indigo-100/70 blur-3xl dark:bg-indigo-500/15"/><div className="relative flex items-start justify-between gap-4"><div><span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><FileText size={23}/></span><h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">My Library</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Your private PDFs, organized and ready when you need them.</p></div><Link href="/dashboard/upload" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"><Upload size={15}/> Add PDF</Link></div>
    {(error || loadError) && <p role="alert" className="relative mt-6 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">{error || loadError}</p>}
    <div className="relative mt-8">{materials.length ? <div className="space-y-2">{materials.map(material=><article key={material.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-indigo-100 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-500/10"><FileText size={20}/></span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold">{material.originalName}</h3><p className="mt-1 text-xs text-slate-400">PDF · {formatBytes(material.sizeBytes)} · {formatDate(material.createdAt)}</p></div><span className="w-fit rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10">{material.status === "ready" ? "Ready" : material.status}</span><div className="flex gap-2"><button disabled={busyId===material.id} onClick={() => void download(material)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-50 dark:border-white/10" aria-label={`Download ${material.originalName}`}>{busyId===material.id?<LoaderCircle size={16} className="animate-spin"/>:<Download size={16}/>}</button><button disabled={busyId===material.id} onClick={() => void remove(material)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-50 dark:border-white/10" aria-label={`Delete ${material.originalName}`}><Trash2 size={16}/></button></div></article>)}</div> : !loadError && <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-5 py-12 text-center dark:border-indigo-400/25 dark:bg-indigo-500/5"><span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-white/10"><FileText size={20}/></span><h3 className="mt-4 font-bold">Your library is empty</h3><p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">Upload your first PDF to keep it securely in LectureMate.</p><Link href="/dashboard/upload" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white"><Upload size={15}/> Add PDF</Link></div>}</div></section></div>;
}
