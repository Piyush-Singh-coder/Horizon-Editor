import { AlertTriangle, CheckCircle, Clock, Terminal } from "lucide-react";
import { useCodeEditorStore } from "../store/codeEditorStore";
import RunningCodeSkeleton from "./RunningCodeSkeleton";

const OutputPanel = () => {
  const { output, error, isRunning } = useCodeEditorStore();
  const hasOutput = output || error;

  return (
    <div className="relative bg-bg-secondary rounded-2xl border border-border-primary p-5 h-full flex flex-col overflow-hidden shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-text-muted" />
          <h2 className="text-[10px] tracking-widest font-extrabold uppercase text-text-muted">
            Console Output
          </h2>
        </div>
        {isRunning && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            RUNNING
          </div>
        )}
      </div>

      {/* Output Area */}
      <div className="relative flex-1 bg-bg-tertiary/40 rounded-xl border border-border-primary/60 overflow-hidden font-mono text-xs md:text-sm">
        {isRunning ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
            <RunningCodeSkeleton />
            <span className="text-text-muted text-xs font-medium">
              Executing code...
            </span>
          </div>
        ) : !hasOutput ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-text-muted/65">
            <Clock className="w-6 h-6 stroke-[1.5]" />
            <p className="text-xs font-semibold uppercase tracking-wider">Ready to execute</p>
          </div>
        ) : (
          <div className="p-5 h-full overflow-y-auto custom-scrollbar">
            {error ? (
              <div className="flex items-start gap-3 text-red-500 dark:text-red-400">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">{error}</pre>
              </div>
            ) : (
              <div className="flex items-start gap-3 text-text-primary">
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">{output}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
