import { useCodeEditorStore } from "../store/codeEditorStore";
import { THEMES } from "../lib/language";
import { ChevronDown, Palette } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const ThemeSelector = () => {
  const { theme, setTheme } = useCodeEditorStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentTheme = THEMES.find((t) => t.id === theme);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!currentTheme) return null;

  return (
    <div className="relative group z-40" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-border-primary/70 hover:border-primary/40 bg-bg-secondary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all w-38 justify-between shadow-sm cursor-pointer animate-none"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Palette className="w-4 h-4 text-text-muted" />
          <span className="text-xs font-semibold truncate">
            {currentTheme.label}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-bg-secondary rounded-2xl shadow-2xl border border-border-primary p-1.5 animate-in fade-in zoom-in-95 duration-150 max-h-75 overflow-y-auto custom-scrollbar">
          <div className="px-2 py-1.5 text-[9px] uppercase font-bold text-text-muted tracking-wider border-b border-border-primary/50 mb-1 select-none">
            Editor Theme
          </div>
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                theme === t.id
                  ? "bg-primary-soft text-primary"
                  : "hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
              }`}
              onClick={() => {
                setTheme(t.id);
                setIsOpen(false);
              }}
            >
              <div
                className="w-3 h-3 rounded-full border border-border-primary/80 shrink-0"
                style={{ backgroundColor: t.color }}
              />
              <span className="flex-1 text-left truncate">{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
