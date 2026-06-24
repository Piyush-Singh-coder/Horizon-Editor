import { ZapIcon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RateLimitPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-bg-primary p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-bg-secondary border border-border-primary/80 rounded-2xl p-8 md:p-12 shadow-2xl backdrop-blur-sm relative overflow-hidden transition-all duration-300">
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>

          <div className="relative flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 shadow-inner">
              <ZapIcon className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent tracking-tight">
              Rate Limit Exceeded
            </h1>

            <p className="text-sm text-text-secondary mb-2 font-semibold">
              You've made too many requests in a short period.
            </p>

            <p className="text-xs text-text-muted mb-8 max-w-sm leading-relaxed">
              Please wait a moment before trying again. We limit request frequencies to
              ensure a fast and fair coding environment for all developers.
            </p>

            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Return to Editor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimitPage;
