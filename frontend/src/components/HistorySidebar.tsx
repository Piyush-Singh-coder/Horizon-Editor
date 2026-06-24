import { useEffect } from "react";
import { useExecutionStore } from "../store/executionStore";
import { useCodeEditorStore } from "../store/codeEditorStore";
import { Trash2, Clock, SaveIcon } from "lucide-react";

const HistorySidebar = () => {
  const { executions, fetchExecutions, deleteExecution, isLoading } =
    useExecutionStore();
  const { setCode, setLanguage, setOutput } = useCodeEditorStore();

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  return (
    <div className="w-64 h-full bg-bg-secondary flex flex-col transition-all duration-300">
      <div className="p-4 border-b border-border-primary/50 bg-bg-tertiary/20 flex items-center justify-between">
        <h2 className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-2 select-none">
          <SaveIcon className="w-4 h-4 text-primary" />
          Saved Executions
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {isLoading && executions.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : executions.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-xs font-medium">
            No saved executions yet.
          </div>
        ) : (
          executions.map((execution) => (
            <div
              key={execution._id}
              className="group p-3.5 rounded-xl cursor-pointer bg-bg-primary/45 hover:bg-bg-tertiary/30 border border-border-primary hover:border-primary/40 transition-all duration-200 shadow-sm"
              onClick={() => {
                setCode(execution.code);
                setLanguage(execution.language);
                setOutput(execution.output);
              }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-primary-soft text-primary">
                  {execution.language}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteExecution(execution._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-150 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-xs text-text-secondary truncate font-mono select-none">
                {execution.code.substring(0, 30)}...
              </div>
              <div className="mt-2.5 text-[10px] text-text-muted flex items-center gap-1.5 font-medium select-none">
                <Clock className="w-3.5 h-3.5 text-text-muted/70" />
                {new Date(execution.createdAt).toLocaleDateString()}{" "}
                {new Date(execution.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistorySidebar;
