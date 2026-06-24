import { useState } from "react";
import { Clock, Trash2, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useSnippetStore } from "../store/snippetStore";
import StarButton from "./StarButton";

function SnippetCard({ snippet }: { snippet: any }) {
  const { user } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteSnippet } = useSnippetStore();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    setIsDeleting(true);
    try {
      await deleteSnippet(snippet._id);
    } catch (error) {
      console.error("Error deleting snippet:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group relative bg-bg-secondary hover:bg-bg-secondary/60 rounded-2xl border border-border-primary hover:border-primary/45 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden">
      <Link
        to={`/snippets/${snippet._id}`}
        className="h-full flex flex-col justify-between"
      >
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between relative">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-bg-tertiary border border-border-primary/80">
                <img
                  src={`/${snippet.language}.png`}
                  alt={`${snippet.language} logo`}
                  className="w-5 h-5 object-contain select-none"
                />
              </div>
              <div>
                <div className="inline-flex items-center px-2 py-0.5 rounded bg-primary-soft text-primary text-[9px] uppercase tracking-wider font-bold select-none mb-1">
                  {snippet.language}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-medium select-none">
                  <Clock className="w-3 h-3 text-text-muted/80" />
                  {new Date(snippet.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div
              className="flex items-center gap-2 absolute top-0 right-0 z-10"
              onClick={(e) => e.preventDefault()}
            >
              <StarButton snippet={snippet} />

              {user && snippet.user && user._id === snippet.user._id && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-150 cursor-pointer ${
                    isDeleting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-label="Delete snippet"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Title & Author */}
          <div>
            <h2 className="text-base font-bold text-text-primary mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
              {snippet.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-text-secondary select-none font-medium">
              <div className="w-5 h-5 rounded-full bg-bg-tertiary border border-border-primary/80 flex items-center justify-center">
                <User className="w-3 h-3 text-text-muted" />
              </div>
              <span className="truncate max-w-[150px]">
                {snippet.user?.fullName || "Anonymous"}
              </span>
            </div>
          </div>

          {/* Code Preview */}
          <div className="relative rounded-xl bg-bg-primary/55 border border-border-primary/80 overflow-hidden h-24 font-mono text-[11px] leading-relaxed select-none">
            <pre className="p-3 text-text-muted/95 whitespace-pre-wrap break-all opacity-80 select-none">
              {snippet.code}
            </pre>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-secondary group-hover:to-bg-secondary opacity-90 transition-all duration-300" />
          </div>
        </div>
      </Link>
    </div>
  );
}

export default SnippetCard;
