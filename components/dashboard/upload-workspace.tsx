"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, FileText, FolderOpen, LoaderCircle, Sparkles, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { completePdfUpload, createPdfUploadTicket } from "@/app/actions/materials";
import { maxPdfBytes } from "@/lib/materials/constants";
import { validatePdfMetadata } from "@/lib/materials/validation";
import type { Material } from "@/types/material";

const stages = ["Upload complete", "Verifying PDF", "Saving to your library", "Ready"];
type UploadState = "idle" | "uploading" | "processing" | "complete";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

async function isPdfFile(file: File) {
  const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return new TextDecoder().decode(signature) === "%PDF-";
}

function uploadToSignedUrl(url: string, file: File, onProgress: (progress: number) => void, signalRef: React.MutableRefObject<XMLHttpRequest | null>) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    signalRef.current = request;
    request.open("PUT", url);
    request.setRequestHeader("x-upsert", "false");
    request.upload.addEventListener("progress", event => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener("load", () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error("Storage rejected the PDF upload.")));
    request.addEventListener("error", () => reject(new Error("The upload was interrupted by a network error.")));
    request.addEventListener("abort", () => reject(new Error("Upload cancelled.")));
    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file, file.name);
    request.send(body);
  });
}

export function UploadWorkspace({ recentMaterials, totalBytes }: { recentMaterials: Material[]; totalBytes: number }) {
  const router = useRouter();
  const [state, setState] = useState<UploadState>("idle"); const [progress, setProgress] = useState(0); const [stage, setStage] = useState(0); const [name, setName] = useState(""); const [size, setSize] = useState(0); const [dragging, setDragging] = useState(false); const [error, setError] = useState("");
  const [visibleRecent, setVisibleRecent] = useState(recentMaterials);
  const input = useRef<HTMLInputElement>(null); const activeRequest = useRef<XMLHttpRequest | null>(null);

  useEffect(() => setVisibleRecent(recentMaterials), [recentMaterials]);

  async function start(file?: File) {
    setError("");
    if (!file) { setError("Choose a PDF file to upload."); return; }
    const metadata = { originalName: file.name, mimeType: file.type, sizeBytes: file.size };
    const validationError = validatePdfMetadata(metadata);
    if (validationError) { setError(validationError); return; }
    if (!(await isPdfFile(file))) { setError("This file does not contain a valid PDF signature."); return; }

    setName(file.name); setSize(file.size); setProgress(0); setStage(0); setState("uploading");
    const ticket = await createPdfUploadTicket(metadata);
    if (ticket.error || !ticket.data) { setState("idle"); setError(ticket.error ?? "Unable to prepare the upload."); return; }

    try {
      await uploadToSignedUrl(ticket.data.signedUrl, file, setProgress, activeRequest);
      activeRequest.current = null; setProgress(100); setState("processing"); setStage(1);
      setStage(2);
      const completed = await completePdfUpload({ ...metadata, objectPath: ticket.data.objectPath });
      if (completed.error || !completed.data) throw new Error(completed.error ?? "The saved PDF could not be returned.");
      const savedMaterial = completed.data;
      setVisibleRecent(current => [savedMaterial, ...current.filter(material => material.id !== savedMaterial.id)].slice(0, 3));
      setStage(3); setState("complete"); router.refresh();
    } catch (uploadError) {
      activeRequest.current = null; setState("idle");
      setError(uploadError instanceof Error ? uploadError.message : "The upload failed. Please try again.");
    }
  }

  function choose(event: ChangeEvent<HTMLInputElement>) { void start(event.target.files?.[0]); event.target.value = ""; }
  function drop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); setDragging(false); void start(event.dataTransfer.files[0]); }
  function cancel() { activeRequest.current?.abort(); activeRequest.current = null; setState("idle"); }

  return <div className="mx-auto max-w-[1500px]"><div className="mb-7"><p className="text-sm font-medium text-indigo-600">MATERIAL INTAKE</p><h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Add something worth learning.</h2><p className="mt-2 text-sm text-slate-500">Upload a PDF securely to your private LectureMate library.</p></div><div className="grid gap-6 xl:grid-cols-[1fr_310px]">
    <div className="space-y-6"><section onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop} className={`relative overflow-hidden rounded-3xl border border-dashed p-6 transition sm:p-8 ${dragging ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-500/10" : "border-indigo-200 bg-white/75 dark:border-indigo-400/20 dark:bg-white/[.03]"}`}><div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-indigo-100/60 blur-3xl dark:bg-indigo-500/10"/>
      <AnimatePresence mode="wait">{state === "idle" ? <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="relative py-8 text-center sm:py-12"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200"><UploadCloud size={28}/></span><h3 className="mt-5 text-lg font-bold">Drop your PDF here</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Drag and drop one PDF, or browse files from your computer.</p><div className="mt-6 flex justify-center"><span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-500 dark:bg-rose-500/10"><FileText size={13}/>PDF only · max 25 MB</span></div>{error && <p role="alert" className="mx-auto mt-5 max-w-md rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}<div className="mt-7 flex flex-wrap justify-center gap-3"><button onClick={() => input.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"><FolderOpen size={16}/> Browse PDFs</button><Link href="/dashboard/library" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"><FileText size={16}/> View library</Link></div><input ref={input} onChange={choose} type="file" className="hidden" accept="application/pdf,.pdf"/></motion.div> : <motion.div key="progress" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="relative py-3 sm:py-5"><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10"><FileText size={22}/></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-bold">{name}</p>{state === "complete" ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">Ready</span> : <button aria-label="Cancel upload" onClick={cancel}><X size={17} className="text-slate-400"/></button>}</div><p className="mt-1 text-xs text-slate-500">{state === "uploading" ? `${progress}% uploaded · ${formatBytes(size)}` : state === "complete" ? "Stored securely in My Library" : "Verifying and saving your PDF"}</p>{state === "uploading" && <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><motion.div className="h-full rounded-full bg-indigo-600" animate={{width:`${progress}%`}}/></div>}</div></div>
        {state !== "uploading" && <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[.03]"><div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-bold">Secure upload timeline</p><p className="mt-1 text-xs text-slate-500">Your PDF remains private to your account.</p></div>{state === "processing" && <LoaderCircle size={18} className="animate-spin text-indigo-600"/>}</div><div className="grid gap-2 sm:grid-cols-2">{stages.map((label,index)=>{ const active = state === "complete" || index <= stage; const current = state === "processing" && index === stage; return <motion.div key={label} initial={{opacity:.35}} animate={{opacity:active?1:.35}} className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 dark:bg-white/5"><span className={`grid h-5 w-5 place-items-center rounded-full ${active?"bg-emerald-500 text-white":"bg-slate-200 text-slate-400 dark:bg-white/10"}`}>{current?<LoaderCircle size={11} className="animate-spin"/>:active?<Check size={12}/>:<span className="text-[9px]">{index+1}</span>}</span><span className={`text-xs font-medium ${active?"text-slate-700 dark:text-slate-200":"text-slate-400"}`}>{label}</span></motion.div>;})}</div></div>}
        {state === "complete" && <button onClick={() => { setState("idle"); setError(""); }} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white"><Sparkles size={15}/> Upload another PDF <ChevronRight size={14}/></button>}</motion.div>}</AnimatePresence>
    </section>
    <section className="rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[.03]"><div className="flex items-center justify-between"><div><h3 className="font-bold">Recent uploads</h3><p className="mt-1 text-xs text-slate-500">Your latest private PDFs</p></div><Link href="/dashboard/library" className="text-xs font-bold text-indigo-600">View all</Link></div><div className="mt-5 space-y-2">{visibleRecent.length ? visibleRecent.map(material=><div key={material.id} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50 dark:hover:bg-white/5"><span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10"><FileText size={16}/></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{material.originalName}</p><p className="truncate text-[10px] text-slate-400">PDF · {formatBytes(material.sizeBytes)}</p></div><div className="text-right"><p className="text-[10px] font-bold text-emerald-600">Ready</p><p className="text-[9px] text-slate-400">{formatDate(material.createdAt)}</p></div></div>) : <p className="py-5 text-center text-xs text-slate-400">No PDFs uploaded yet.</p>}</div></section>
    </div>
    <aside className="space-y-4"><section className="rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[.03]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10"><Sparkles size={17}/></span><h3 className="mt-4 text-sm font-bold">Make uploads work harder</h3><ul className="mt-3 space-y-3 text-xs leading-5 text-slate-500"><li>Use clear file names for easier organization.</li><li>Upload the original PDF for best quality.</li><li>Your files are stored in a private, user-owned folder.</li></ul></section><section className="rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[.03]"><h3 className="text-sm font-bold">Upload details</h3><div className="mt-4 space-y-4">{[["Accepted format","PDF"],["Upload limit","25 MB per file"],["Privacy","Private to your account"]].map(([label,value])=><div key={label}><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{value}</p></div>)}</div></section><section className="rounded-2xl bg-slate-950 p-5 text-white"><div className="flex items-center justify-between"><span className="text-sm font-bold">Stored PDFs</span><span className="text-xs text-slate-400">Private</span></div><p className="mt-3 text-2xl font-bold">{formatBytes(totalBytes)}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-indigo-400" style={{width:`${Math.min(100,(totalBytes/maxPdfBytes)*100)}%`}}/></div><Link href="/dashboard/library" className="mt-4 inline-block text-xs font-bold text-indigo-300">Manage library →</Link></section></aside>
  </div></div>;
}
