import { useState } from "react";
import toast from "react-hot-toast";
import EditorPanel from "../components/EditorPanel";
import OutputPanel from "../components/OutputPanel";
import HistorySidebar from "../components/HistorySidebar";
import { useCodeEditorStore } from "../store/codeEditorStore";
import {
  PlayIcon,
  RotateCcwIcon,
  SaveIcon,
  ShareIcon,
  TypeIcon,
} from "lucide-react";
import LanguageSelector from "../components/LanguageSelector";
import ThemeSelector from "../components/ThemeSelector";
import ShareSnippetDialog from "../components/ShareSnippetDialog";
import SaveExecutionDialog from "../components/SaveExecutionDialog";
import { useAuthStore } from "../store/authStore";
import RunningCodeSkeleton from "../components/RunningCodeSkeleton";

const HomePage = () => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const { user } = useAuthStore();

  const { language, editor, runCode, isRunning, fontSize, setFontSize } =
    useCodeEditorStore();

  const handleFontSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(newSize, 12), 24);
    setFontSize(size);
    localStorage.setItem("editor-font-size", size.toString());
  };

  const handleRefresh = () => {
    if (editor) {
      editor.setValue(""); // Or reset default
      localStorage.removeItem(`editor-code-${language}`);
      window.location.reload(); // Simple refresh for now or just reset value
    }
  };

  const handleAction = (action: () => void) => {
    if (!user) {
      toast.error("Please log in to use this feature");
      return;
    }
    action();
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block h-full border-r border-border-primary/50">
          <HistorySidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-bg-primary/30">
          {/* Toolbar */}
          <div className="h-auto md:h-14 border-b border-border-primary bg-bg-secondary/60 backdrop-blur-md flex flex-col md:flex-row items-center justify-between p-3 md:p-0 md:px-6 gap-3 md:gap-0 z-10 shrink-0">
            {/* Left: Selectors & Refresh */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <LanguageSelector />
              <ThemeSelector />

              <button
                onClick={handleRefresh}
                className="p-2 text-text-muted hover:text-text-primary bg-bg-tertiary/50 hover:bg-bg-tertiary border border-border-primary/60 rounded-xl transition-all duration-200 cursor-pointer"
                title="Reset Code"
              >
                <RotateCcwIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Font Size & Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {/* Font Size Slider */}
              <div className="flex items-center gap-2.5 bg-bg-tertiary/40 px-3 py-1.5 rounded-xl border border-border-primary/50">
                <TypeIcon className="w-3.5 h-3.5 text-text-muted" />
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) =>
                    handleFontSizeChange(parseInt(e.target.value))
                  }
                  className="w-16 md:w-20 h-1 bg-border-primary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-[11px] font-bold text-text-muted min-w-[20px] text-right">
                  {fontSize}px
                </span>
              </div>

              <button
                onClick={() => handleAction(() => setIsSaveDialogOpen(true))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-primary/60 hover:border-border-primary bg-bg-secondary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all duration-200 text-xs font-semibold cursor-pointer"
              >
                <SaveIcon className="w-3.5 h-3.5" />
                Save
              </button>
              <button
                onClick={() => handleAction(() => setIsShareDialogOpen(true))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all duration-200 text-xs font-semibold cursor-pointer"
              >
                <ShareIcon className="w-3.5 h-3.5" />
                Share
              </button>

              <button
                onClick={() => handleAction(runCode)}
                disabled={isRunning}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white transition-all duration-200 text-xs font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isRunning ? (
                  <RunningCodeSkeleton />
                ) : (
                  <>
                    <PlayIcon className="w-3.5 h-3.5 fill-current" />
                    Run
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor & Output Split */}
          <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
            {/* Editor Section */}
            <div className="flex-1 md:flex-[0.5] lg:flex-[0.48] h-[55vh] md:h-full overflow-hidden">
              <EditorPanel />
            </div>

            {/* Output Section */}
            <div className="flex-1 md:flex-[0.5] lg:flex-[0.52] h-[45vh] md:h-full overflow-hidden">
              <OutputPanel />
            </div>
          </div>
        </main>
      </div>

      {/* Dialogs */}
      {isShareDialogOpen && (
        <ShareSnippetDialog onClose={() => setIsShareDialogOpen(false)} />
      )}
      {isSaveDialogOpen && (
        <SaveExecutionDialog onClose={() => setIsSaveDialogOpen(false)} />
      )}
    </div>
  );
};

export default HomePage;
