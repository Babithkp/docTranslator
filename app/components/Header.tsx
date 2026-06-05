import { Languages } from "lucide-react";export default function Header() {
  return (
    <header className="bg-white border-b border-border px-6 py-4 flex items-center gap-3 shadow-sm border-amber-50">
      <div
        className="p-1.5 rounded-lg"
        style={{ background: "linear-gradient(135deg, #6c47ff, #10b981)" }}
      >
        <Languages className="w-4 h-4 text-white" />
      </div>
      <span style={{ color: "#6c47ff", fontWeight: 600 }}>DocTranslate</span>
    </header>
  );
}
