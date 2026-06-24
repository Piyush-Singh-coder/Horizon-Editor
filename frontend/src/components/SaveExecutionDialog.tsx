import { X } from "lucide-react";
import { useState } from "react";
import { useCodeEditorStore } from "../store/codeEditorStore";
import { useExecutionStore } from "../store/executionStore";

const SaveExecutionDialog = ({ onClose }: { onClose: () => void }) => {
  const [isSaving, setIsSaving] = useState(false);
  const { language, editor, output } = useCodeEditorStore();
  const { saveExecution } = useExecutionStore();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const code = editor?.getValue() || "";
      await saveExecution({
        language,
        code,
        output: output || "",
      });
      onClose();
    } catch (error) {
      console.error("Error saving execution:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-bg-secondary rounded-2xl shadow-2xl w-full max-w-md border border-border-primary overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-border-primary/50 bg-bg-tertiary/10">
          <h2 className="text-sm font-bold tracking-tight text-text-primary">Save Execution</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-bg-tertiary rounded-xl text-text-muted hover:text-text-primary transition-all duration-150 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="space-y-3">
            <p className="text-xs text-text-secondary leading-relaxed">
              Save this code execution to your history. You can retrieve it anytime from your profile sidebar.
            </p>
            <div className="bg-bg-primary border border-border-primary/70 p-4 rounded-xl text-xs space-y-2 text-text-secondary select-none font-medium">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Language:</span>
                <span className="uppercase font-bold text-primary">{language}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Code Length:</span>
                <span className="font-semibold text-text-primary">{editor?.getValue().length || 0} chars</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Output Length:</span>
                <span className="font-semibold text-text-primary">{output?.length || 0} chars</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-tertiary/50 hover:bg-bg-tertiary rounded-xl border border-border-primary/60 transition-all duration-150 cursor-pointer"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-150 cursor-pointer flex items-center justify-center min-w-[120px] disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Save Execution"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveExecutionDialog;
