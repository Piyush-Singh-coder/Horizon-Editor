import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, Code2, Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
  const { login, isLoggingIn, googleLogin } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate("/");
    } catch {
      console.log("Login failed");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      navigate("/");
    } catch {
      console.log("Google Login failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2 bg-bg-primary text-text-primary transition-colors duration-300">
      {/* Left Side - Login Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-hidden">
        {/* Ambient glow decoration */}
        <div className="absolute top-10 left-10 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Form Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-soft border border-primary/20 mb-2">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text">
              Welcome Back
            </h2>
            <p className="text-sm text-text-muted">
              Enter your credentials to access your secure workspace
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-bg-secondary border border-border-primary rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary pl-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                  </div>
                  <input
                    type="email"
                    className="w-full bg-bg-tertiary border border-border-primary rounded-xl px-4 py-3 pl-10 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-xs font-semibold text-text-secondary">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:text-primary-hover hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                  </div>
                  <input
                    type="password"
                    className="w-full bg-bg-tertiary border border-border-primary rounded-xl px-4 py-3 pl-10 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 active:scale-[0.98] hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center text-sm"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-primary"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-bg-secondary text-text-muted">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login */}
            <button
              type="button"
              className="w-full bg-bg-tertiary hover:bg-bg-primary border border-border-primary text-text-secondary font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none text-sm cursor-pointer"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-text-muted">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:text-primary-hover font-semibold transition-colors hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Premium Branding Screen */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-bg-secondary border-l border-border-primary relative overflow-hidden p-12">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />

        <div className="max-w-md w-full relative z-10 space-y-8">
          {/* Tag badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-soft border border-primary/20">
            <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-primary">
              Instant Cloud Execution
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Compile. Run. <br />
              <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">Share snippets.</span>
            </h1>
            <p className="text-base text-text-muted">
              A premium, high-performance web-based editor. Compile code in multiple languages instantly, share snippets, and collaborate seamlessly.
            </p>
          </div>

          {/* Code Window Mockup */}
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative rounded-2xl overflow-hidden bg-[#0A0D1A] border border-slate-800 shadow-2xl">
              {/* Window header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#0e1224] border-b border-slate-800/60">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#070914] border border-slate-800/40">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-mono text-slate-300">fibonacci.ts</span>
                </div>
                <div className="w-14" />
              </div>

              {/* Code Workspace */}
              <div className="p-5 font-mono text-xs leading-relaxed text-slate-300">
                <p><span className="text-pink-400">function</span> <span className="text-emerald-400">fib</span>(n: <span className="text-amber-400">number</span>): <span className="text-amber-400">number</span> &#123;</p>
                <p className="pl-4"><span className="text-pink-400">if</span> (n &lt;= <span className="text-amber-400">1</span>) <span className="text-pink-400">return</span> n;</p>
                <p className="pl-4"><span className="text-pink-400">return</span> <span className="text-emerald-400">fib</span>(n - <span className="text-amber-400">1</span>) + <span className="text-emerald-400">fib</span>(n - <span className="text-amber-400">2</span>);</p>
                <p>&#125;</p>
                <br />
                <p><span className="text-slate-500">// Run performance check</span></p>
                <p><span className="text-pink-400">console</span>.<span className="text-blue-400">log</span>(<span className="text-emerald-400">fib</span>(<span className="text-amber-400">10</span>));</p>
              </div>

              {/* Console logs */}
              <div className="bg-[#04060d] px-4 py-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Execution succeeded
                </span>
                <span className="text-slate-500">Output: 55</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
