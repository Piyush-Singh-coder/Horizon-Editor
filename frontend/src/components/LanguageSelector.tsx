import { useCodeEditorStore } from "../store/codeEditorStore";
import { LANGUAGE_CONFIG } from "../lib/language";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const LanguageSelector = () => {
  const { language, setLanguage } = useCodeEditorStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Current Language Data
  const currentLanguage =
    LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG];

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

  if (!currentLanguage) return null;

  return (
    <div className="relative group z-40" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-border-primary/70 hover:border-primary/40 bg-bg-secondary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all w-40 justify-between shadow-sm cursor-pointer"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <img
            src={currentLanguage.logoPath}
            alt={currentLanguage.label}
            className="w-4 h-4 object-contain"
          />
          <span className="text-xs font-semibold truncate">
            {currentLanguage.label}
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
        <div className="absolute top-full left-0 mt-2 w-48 bg-bg-secondary rounded-2xl shadow-2xl border border-border-primary p-1.5 animate-in fade-in zoom-in-95 duration-150 max-h-75 overflow-y-auto custom-scrollbar">
          <div className="px-2 py-1.5 text-[9px] uppercase font-bold text-text-muted tracking-wider border-b border-border-primary/50 mb-1 select-none">
            Select Language
          </div>
          {Object.values(LANGUAGE_CONFIG).map((lang) => (
            <button
              key={lang.id}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                language === lang.id
                  ? "bg-primary-soft text-primary"
                  : "hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
              }`}
              onClick={() => {
                setLanguage(lang.id);
                setIsOpen(false);
              }}
            >
              <img
                src={lang.logoPath}
                alt={lang.label}
                className="w-4 h-4 object-contain"
              />
              <span className="flex-1 text-left">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
