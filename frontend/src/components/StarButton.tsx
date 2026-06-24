import { Star } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useSnippetStore } from "../store/snippetStore";
import toast from "react-hot-toast";

function StarButton({ snippet }: { snippet: any }) {
  const { user } = useAuthStore();
  const { toggleStar } = useSnippetStore();
  const isStarred = user && snippet.stars.includes(user._id);
  const starCount = snippet.stars.length;

  const handleStar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please log in to star snippets!");
      return;
    }

    try {
      await toggleStar(snippet._id);
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  };

  return (
    <button
      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-primary/60 transition-all duration-200 cursor-pointer ${
        isStarred
          ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 shadow-sm"
          : "bg-bg-tertiary/65 text-text-muted hover:bg-bg-tertiary hover:text-text-primary hover:border-border-primary"
      }`}
      onClick={handleStar}
    >
      <Star
        className={`w-3.5 h-3.5 transition-transform duration-200 group-active:scale-90 ${
          isStarred ? "fill-amber-500 stroke-amber-500" : "fill-none group-hover:fill-amber-500/30 group-hover:text-amber-500"
        }`}
      />
      <span className="text-xs font-bold">{starCount}</span>
    </button>
  );
}

export default StarButton;
