import { useEffect, useState } from "react";
import { BookOpen, Code, Grid, Layers, Search, Tag, X } from "lucide-react";
import Navbar from "../components/Navbar";
import { useSnippetStore } from "../store/snippetStore";
import SnippetCard from "../components/SnippetCard";

function SnippetPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [view, setView] = useState("grid");
  const { snippets, fetchSnippets, loading } = useSnippetStore();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSnippets();
  }, [fetchSnippets]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-text-muted">Loading snippets...</p>
      </div>
    );

  if (!snippets)
    return (
      <div className="min-h-screen bg-bg-primary">
        <Navbar />
      </div>
    );

  const languages = [
    ...new Set(snippets.map((s) => s.language).filter(Boolean)),
  ];
  const popularLanguages = languages.slice(0, 5);

  const filteredSnippets = snippets.filter((snippet) => {
    const title = snippet.title?.toLowerCase() || "";
    const language = snippet.language?.toLowerCase() || "";
    const userName = snippet.user?.fullName?.toLowerCase() || "";
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      title.includes(search) ||
      language.includes(search) ||
      userName.includes(search);

    const matchesLanguage =
      !selectedLanguage || snippet.language === selectedLanguage;

    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-bg-primary pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-5 select-none">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Community Library</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 bg-clip-text text-transparent tracking-tight">
            Discover & Share Code Snippets
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto text-xs sm:text-sm font-medium leading-relaxed">
            Explore and learn from curated snippets shared by developers in the Horizon community.
          </p>
        </div>

        {/* Search & Filter Panel */}
        <div className="flex flex-col gap-6 mb-12">
          {/* Search Input */}
          <div className="relative w-full">
            <div className="flex items-center bg-bg-secondary rounded-2xl shadow-xl border border-border-primary/80 transition-all duration-300 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30">
              <div className="absolute left-4 pointer-events-none">
                <Search className="w-5 h-5 text-text-muted" />
              </div>
              <input
                type="text"
                placeholder="Search snippets by title, language, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-12 pr-12 py-4 focus:outline-none text-sm font-medium text-text-primary placeholder:text-text-muted"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 p-1.5 hover:bg-bg-tertiary rounded-xl text-text-muted hover:text-red-500 transition-all duration-150 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Language Filter + View Toggle */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 bg-bg-secondary rounded-2xl p-5 shadow-xl border border-border-primary/80">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-text-muted font-bold uppercase tracking-wider select-none">
                <Tag className="w-4 h-4" /> Filter Language:
              </div>

              {popularLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() =>
                    setSelectedLanguage(lang === selectedLanguage ? null : lang)
                  }
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    selectedLanguage === lang
                      ? "bg-primary text-white border border-primary shadow-md shadow-primary/20 scale-105"
                      : "bg-bg-tertiary/65 border border-border-primary/80 text-text-secondary hover:bg-bg-tertiary hover:text-text-primary hover:border-border-primary"
                  }`}
                >
                  <img
                    src={`/${lang}.png`}
                    alt={lang}
                    className="w-3.5 h-3.5 object-contain"
                  />
                  {lang}
                </button>
              ))}

              {selectedLanguage && (
                <button
                  onClick={() => setSelectedLanguage(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25 hover:bg-red-500/20 transition-all duration-150 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* View Toggle Buttons */}
            <div className="flex items-center gap-1 bg-bg-tertiary/70 rounded-xl p-1 border border-border-primary/85 shrink-0 self-end lg:self-auto">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  view === "grid"
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-secondary/40"
                }`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  view === "list"
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-secondary/40"
                }`}
                title="List view"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Snippets Grid */}
        <div
          className={`grid gap-6 ${
            view === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 max-w-4xl mx-auto"
          }`}
        >
          {filteredSnippets.map((snippet) => (
            <SnippetCard key={snippet._id} snippet={snippet} />
          ))}
        </div>

        {/* Empty State */}
        {filteredSnippets.length === 0 && (
          <div className="text-center mt-20 p-8 rounded-2xl bg-bg-secondary border border-border-primary max-w-xl mx-auto shadow-2xl animate-in fade-in duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-tertiary border border-border-primary mb-6 shadow-md">
              <Code className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">
              No snippets found
            </h3>
            <p className="text-xs text-text-muted mb-6 leading-relaxed">
              {searchQuery || selectedLanguage
                ? "Try adjusting your search or filters to discover more snippets."
                : "Be the first to share a snippet with the community!"}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedLanguage(null);
              }}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-150 cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SnippetPage;
