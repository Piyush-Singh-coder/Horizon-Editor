import { useEffect, useState } from "react";
import { Clock, Code, MessageSquare, User } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import { useSnippetStore } from "../store/snippetStore";
import { useAuthStore } from "../store/authStore";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "../lib/language";

function SnippetDetailPage() {
  const { id } = useParams();
  const { snippets, fetchSnippets, addComment } = useSnippetStore();
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const snippet = snippets.find((s) => s._id === id);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;

    setIsSubmittingComment(true);
    try {
      await addComment(id, commentText);
      setCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    if (!snippet) {
      fetchSnippets();
    }
  }, [snippet, fetchSnippets]);

  if (!snippet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-text-muted">Loading snippet...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-16">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <div
          key={snippet._id}
          className="bg-bg-secondary shadow-2xl border border-border-primary rounded-2xl overflow-hidden transition-all duration-300"
        >
          {/* Header */}
          <div className="p-6 sm:p-10 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-14 h-14 rounded-2xl bg-bg-tertiary border border-border-primary/80 p-2.5 flex items-center justify-center shrink-0">
                  <img
                    src={`/${snippet.language}.png`}
                    alt={`${snippet.language} logo`}
                    className="object-contain w-full h-full select-none"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight truncate">
                    {snippet.title || "Untitled snippet"}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted mt-1.5 font-medium">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-text-muted/80" />
                      <span className="text-text-secondary font-semibold">{snippet.user?.fullName || "Anonymous"}</span>
                    </div>
                    <div className="h-3 w-px bg-border-primary hidden sm:block" />
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-text-muted/80" />
                      <span>{new Date(snippet.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-primary-soft text-primary text-xs font-bold uppercase tracking-wider select-none border border-primary/20 shrink-0">
                {snippet.language}
              </div>
            </div>

            {/* Code Editor */}
            <div className="border border-border-primary/80 rounded-2xl overflow-hidden shadow-lg">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-primary/50 bg-bg-tertiary/20 select-none">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Code className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider">Source Code</span>
                </div>
              </div>

              <Editor
                height="450px"
                language={
                  (LANGUAGE_CONFIG as any)[snippet.language]?.monacoLanguage ||
                  "plaintext"
                }
                value={snippet.code}
                theme="vs-dark"
                beforeMount={defineMonacoThemes}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  readOnly: true,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  renderWhitespace: "selection",
                  fontFamily: '"JetBrains Mono", Consolas, monospace',
                  fontLigatures: true,
                }}
              />
            </div>

            {/* Comments Section */}
            <div className="mt-8 bg-bg-tertiary/30 p-6 sm:p-8 rounded-2xl border border-border-primary/60">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-6 flex items-center gap-2 select-none">
                <MessageSquare className="w-4 h-4 text-primary" />
                Comments ({snippet.comments?.length || 0})
              </h3>

              {/* Add Comment Form */}
              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts on this snippet..."
                      className="flex-1 px-4 py-3 rounded-xl border border-border-primary bg-bg-primary text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-150 text-sm font-medium"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !commentText.trim()}
                      className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white transition-all duration-150 shadow-md shadow-primary/20 hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center shrink-0"
                    >
                      {isSubmittingComment ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-bg-secondary p-5 rounded-xl border border-border-primary/75 mb-8 text-center text-xs font-semibold text-text-muted">
                  Please log in to leave a comment.
                </div>
              )}

              {snippet.comments?.length === 0 ? (
                <p className="text-text-muted text-xs font-medium">
                  No comments yet. Be the first to start the discussion!
                </p>
              ) : (
                <div className="space-y-4">
                  {snippet.comments?.map((comment) => (
                    <div
                      key={comment._id}
                      className="p-5 bg-bg-secondary rounded-2xl border border-border-primary/75 shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                          <div className="w-6 h-6 rounded-full bg-bg-tertiary border border-border-primary/80 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-text-muted" />
                          </div>
                          {comment.user.fullName}
                        </div>
                        <span className="text-[10px] text-text-muted font-medium">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed pl-8 font-medium">
                        {comment.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SnippetDetailPage;
