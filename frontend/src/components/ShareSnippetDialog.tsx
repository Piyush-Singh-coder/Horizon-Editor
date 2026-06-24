import { useState } from "react";
import { useCodeEditorStore } from "../store/codeEditorStore";
import { useSnippetStore } from "../store/snippetStore";
import { X } from "lucide-react";

const ShareSnippetDialog = ({ onClose }: { onClose: () => void }) => {
  const [title, setTitle] = useState("");
  const { createSnippet, isCreating } = useSnippetStore();
  const { code, language } = useCodeEditorStore();

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createSnippet({ title, code, language });
      onClose();
    } catch (error) {
      console.error("Error sharing snippet:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-bg-secondary rounded-2xl shadow-2xl w-full max-w-md border border-border-primary overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-primary/50 bg-bg-tertiary/10">
          <h2 className="text-sm font-bold tracking-tight text-text-primary">Share Snippet</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-bg-tertiary rounded-xl text-text-muted hover:text-text-primary transition-all duration-150 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleShare} className="p-5 space-y-4">
          {/* Info note */}
          <div className="bg-primary-soft text-xs border border-primary/25 rounded-xl py-2.5 px-3 text-primary font-semibold leading-relaxed">
            This snippet will be visible to everyone in the Community Library.
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
              Snippet Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border-primary bg-bg-primary text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-150 text-sm font-medium"
              placeholder="e.g. Binary Search in Go"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-primary/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-tertiary/50 hover:bg-bg-tertiary rounded-xl border border-border-primary/60 transition-all duration-150 cursor-pointer"
              disabled={isCreating}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-150 cursor-pointer flex items-center justify-center min-w-[100px] disabled:opacity-50"
              disabled={isCreating || !title.trim()}
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Share"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareSnippetDialog;
