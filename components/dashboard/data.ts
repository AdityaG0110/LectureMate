import { BrainCircuit, FileText, Layers3, MessageSquareText, Network, Settings, Sparkles, Upload, CalendarDays, LayoutDashboard } from "lucide-react";

export const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Library", href: "/dashboard/library", icon: FileText },
  { label: "Upload", href: "/dashboard/upload", icon: Upload },
  { label: "AI Notes", href: "/dashboard/notes", icon: Sparkles },
  { label: "Flashcards", href: "/dashboard/flashcards", icon: Layers3 },
  { label: "Quiz Generator", href: "/dashboard/quizzes", icon: BrainCircuit },
  { label: "Mind Maps", href: "/dashboard/mindmaps", icon: Network },
  { label: "AI Chat", href: "/dashboard/chat", icon: MessageSquareText },
  { label: "Revision Planner", href: "/dashboard/revision", icon: CalendarDays },
];

export const pageMeta: Record<string, { title: string; description: string; icon: typeof FileText }> = {
  "/dashboard/library": { title: "My Library", description: "Your materials, organized and ready to learn from.", icon: FileText },
  "/dashboard/upload": { title: "Upload material", description: "Add a lecture, document, or recording to your study space.", icon: Upload },
  "/dashboard/notes": { title: "AI Notes", description: "Clear, structured notes created from your source material.", icon: Sparkles },
  "/dashboard/flashcards": { title: "Flashcards", description: "Build recall with a smarter way to review.", icon: Layers3 },
  "/dashboard/quizzes": { title: "Quiz Generator", description: "Practice with questions tailored to your materials.", icon: BrainCircuit },
  "/dashboard/mindmaps": { title: "Mind Maps", description: "Explore how the ideas in your material connect.", icon: Network },
  "/dashboard/chat": { title: "AI Chat", description: "Ask questions grounded in your uploaded material.", icon: MessageSquareText },
  "/dashboard/revision": { title: "Revision Planner", description: "A calmer, clearer plan for your next exam.", icon: CalendarDays },
  "/dashboard/settings": { title: "Settings", description: "Manage your workspace and preferences.", icon: Settings },
};
