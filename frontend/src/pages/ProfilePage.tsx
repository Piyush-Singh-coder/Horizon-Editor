import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useExecutionStore } from "../store/executionStore";
import { useCodeEditorStore } from "../store/codeEditorStore";
import {
  Calendar,
  Code2,
  Mail,
  Trash2,
  ExternalLink,
  ArrowLeft,
  Camera,
  FileCode,
} from "lucide-react";

// Assuming theme is managed via data-theme on html or similar,
// but for this specific design component logic, we can try to detect or just use DaisyUI capabilities
// which map to the user's requested "dark/light" logic effectively if we use base-content/base-100.
// However, the user provided specific Tailwind colors (gray-900 etc).
// We should try to stick to DaisyUI variables to respect the "Theme Selector" feature we built.
// The user's request said "use this to update ProfilePage", implying they like this specific visual.
// I will adapt the structure to use DaisyUI colors that MATCH the visual intent of the provided code,
// instead of hardcoded grays, to ensure themes still work.

const ProfilePage = () => {
  const { user } = useAuthStore();
  const {
    executions,
    fetchExecutions,
    deleteExecution,
    isLoading,
    fetchExecution,
  } = useExecutionStore();
  const { setCode, setLanguage, setOutput } = useCodeEditorStore();
  const navigate = useNavigate();

  const handleExecutionClick = async (executionId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await fetchExecution(executionId);
      const execution = response.execution;
      if (execution) {
        setCode(execution.code);
        setLanguage(execution.language);
        setOutput(execution.output);
        navigate("/");
      }
    } catch (error) {
      console.error("Error opening execution:", error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchExecutions();
  }, [fetchExecutions]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-text-muted">Loading profile...</p>
      </div>
    );
  }

  // Logic to determine display name and initials
  const displayName = user.fullName || "User Name";

  // Get Initials logic
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };
  const initials = getInitials(displayName);

  return (
    <div className="min-h-screen bg-bg-primary pb-16">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Navigation / Header */}
        <div className="flex items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-bg-tertiary/75 border border-border-primary/80 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all duration-200 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-bg-secondary border border-border-primary shadow-2xl rounded-2xl overflow-hidden mb-10 transition-all duration-300">
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar Section with Initials */}
              <div className="relative group">
                <div className="bg-primary text-white rounded-full w-28 h-28 flex items-center justify-center shadow-xl ring-4 ring-primary/10 select-none">
                  <span className="text-4xl font-extrabold tracking-wider">
                    {initials}
                  </span>
                </div>
                {/* Simulated Upload Button */}
                <button
                  className="absolute bottom-1 right-1 bg-text-primary text-bg-primary p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform cursor-not-allowed opacity-80"
                  title="Upload not available in demo"
                >
                  <Camera size={14} className="text-bg-secondary" />
                </button>
              </div>

              {/* User Info */}
              <div className="text-center md:text-left flex-1 space-y-3.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                  {displayName}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-text-secondary">
                  <div className="flex items-center gap-2 bg-bg-tertiary/50 border border-border-primary/60 px-3.5 py-1.5 rounded-full text-xs font-medium">
                    <Mail className="w-3.5 h-3.5 text-text-muted" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-bg-tertiary/50 border border-border-primary/60 px-3.5 py-1.5 rounded-full text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5 text-text-muted" />
                    <span>
                      Member since{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Active Account</span>
                  </div>
                </div>
              </div>

              {/* Stats/Action */}
              <div className="px-6 py-4.5 rounded-2xl bg-bg-tertiary/45 border border-border-primary/65 text-center min-w-[150px] shadow-sm select-none">
                <div className="text-3xl font-extrabold text-text-primary">
                  {executions.length}
                </div>
                <div className="text-[10px] text-text-muted font-extrabold uppercase tracking-widest mt-1">
                  Saved Snippets
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Executions Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-3 text-text-primary select-none">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-sm">
              <Code2 className="w-5 h-5" />
            </div>
            Saved Executions
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : executions.length === 0 ? (
            <div className="bg-bg-secondary shadow-xl rounded-2xl p-12 text-center border border-border-primary max-w-xl mx-auto">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-bg-tertiary border border-border-primary rounded-full flex items-center justify-center mx-auto text-primary shadow-sm">
                  <FileCode size={26} />
                </div>
                <h3 className="text-base font-bold text-text-primary">
                  No saved snippets yet
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Start coding in the editor and save your work to see it appear here!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {executions.map((execution) => (
                <div
                  key={execution._id}
                  className="group relative bg-bg-secondary rounded-2xl border border-border-primary hover:border-primary/45 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden flex flex-col"
                >
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    {/* Card Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center px-2 py-0.5 rounded bg-primary-soft text-primary text-[9px] uppercase tracking-wider font-bold select-none border border-primary/10">
                          {execution.language}
                        </div>
                        <span className="text-[10px] text-text-muted font-medium select-none">
                          {new Date(execution.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => deleteExecution(execution._id)}
                          className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <h3
                      className="font-bold text-sm text-text-primary truncate"
                      title={execution.language}
                    >
                      {execution.language} Snippet
                    </h3>

                    {/* Code Preview */}
                    <div className="relative flex-1 bg-bg-primary/50 border border-border-primary/80 rounded-xl overflow-hidden min-h-[120px] font-mono text-[11px] leading-relaxed select-none">
                      <div className="absolute top-2 right-2 bg-bg-tertiary border border-border-primary/80 px-2 py-0.5 rounded-lg text-[9px] text-text-muted font-bold z-10">
                        PREVIEW
                      </div>
                      <pre className="p-3 text-text-muted/95 overflow-hidden leading-relaxed font-mono">
                        {execution.code.slice(0, 150)}...
                      </pre>
                      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-bg-secondary group-hover:from-bg-secondary/40 to-transparent"></div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 border-t border-border-primary/60 bg-bg-tertiary/10">
                    <button
                      onClick={() => handleExecutionClick(execution._id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-150 cursor-pointer"
                    >
                      <ExternalLink size={14} />
                      Open in Editor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
