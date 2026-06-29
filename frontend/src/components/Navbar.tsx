import { Menu, X, Sun, Moon, LogOut, Code2, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";

const Navbar = () => {
  const { user, isCheckingAuth, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 w-full z-50 bg-bg-secondary/80 backdrop-blur-lg border-b border-border-primary/60 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-16">
        {/* ---- LOGO ---- */}
        <Link
          to="/"
          className="flex items-center gap-3 group relative no-underline select-none"
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
          <div className="relative bg-bg-tertiary p-2 rounded-xl border border-border-primary group-hover:border-primary/50 transition-all shadow-md">
            <div className="w-6 h-6 flex items-center justify-center text-primary">
              <Code2 className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div className="relative flex flex-col">
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 text-transparent bg-clip-text">
              Horizon
            </span>
            <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold -mt-0.5">
              Code Editor
            </span>
          </div>
        </Link>

        {/* ---- DESKTOP LINKS ---- */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/snippets"
            className={`text-sm font-medium transition-all duration-200 relative py-1 ${
              isActive("/snippets")
                ? "text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Snippets
            {isActive("/snippets") && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1 duration-200" />
            )}
          </Link>

          {user && (
            <Link
              to="/profile"
              className={`text-sm font-medium transition-all duration-200 relative py-1 ${
                isActive("/profile")
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Profile
              {isActive("/profile") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1 duration-200" />
              )}
            </Link>
          )}

          <div className="h-4 w-px bg-border-primary" />

          {/* THEME TOGGLE BUTTON */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-bg-tertiary border border-border-primary hover:border-primary/30 text-text-secondary hover:text-primary transition-all duration-300 shadow-sm relative overflow-hidden cursor-pointer"
            aria-label="Toggle Theme"
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-400 rotate-0 scale-100 transition-all duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600 rotate-0 scale-100 transition-all duration-300" />
              )}
            </div>
          </button>

          {isCheckingAuth ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg-tertiary border border-border-primary">
                <User className="w-4 h-4 text-text-muted" />
                <span className="text-xs font-semibold text-text-secondary">
                  {user.fullName || user.email}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-red-500/5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
                Login
              </button>
            </Link>
          )}
        </div>

        {/* ---- MOBILE MENU BUTTON ---- */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Theme Switcher for mobile */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-bg-tertiary border border-border-primary text-text-secondary hover:text-primary transition-all duration-200 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-xl bg-bg-tertiary border border-border-primary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/80 transition-all duration-200 cursor-pointer"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* ---- MOBILE DROPDOWN ---- */}
      {menuOpen && (
        <div className="md:hidden absolute w-full left-0 bg-bg-secondary/95 backdrop-blur-xl border-b border-border-primary shadow-xl animate-in slide-in-from-top-2 duration-200 z-40">
          <div className="p-5 flex flex-col gap-4">
            <nav className="flex flex-col gap-2">
              <Link
                to="/snippets"
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive("/snippets")
                    ? "bg-primary-soft text-primary"
                    : "text-text-secondary hover:bg-bg-tertiary"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                Snippets
              </Link>
              {isCheckingAuth ? (
                <div className="flex items-center justify-center py-3">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : user ? (
                <>
                  <Link
                    to="/profile"
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive("/profile")
                        ? "bg-primary-soft text-primary"
                        : "text-text-secondary hover:bg-bg-tertiary"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <div className="h-px bg-border-primary my-2" />
                  <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary/50 rounded-xl border border-border-primary/50">
                    <span className="text-xs font-medium text-text-muted">Logged in as</span>
                    <span className="text-xs font-bold text-text-primary">{user.fullName || user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold border border-red-500/20 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="w-full">
                  <button className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-md shadow-primary/20 transition-all duration-200">
                    Login
                  </button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
