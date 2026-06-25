import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Loader, CheckCircle, XCircle, ShieldCheck } from "lucide-react";

const EmailVerificationPage = () => {
  const { token } = useParams<{ token: string }>();
  const { verifyEmail } = useAuthStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");
  
  const hasRun = useRef(false);

  useEffect(() => {
    if (!token || hasRun.current) return;
    hasRun.current = true;

    const performVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus("success");
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (error) {
        console.error("Verification failed:", error);
        setStatus("error");
      }
    };

    performVerification();
  }, [token, verifyEmail, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-bg-primary p-4 relative overflow-hidden transition-colors duration-300">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-bg-secondary border-2 border-border-primary dark:border-border-primary/60 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 sm:p-10 text-center relative z-10 transition-all duration-300 backdrop-blur-sm">
        
        {/* Verification Status: Verifying */}
        {status === "verifying" && (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="relative flex items-center justify-center">
              {/* Spinning outer ring */}
              <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              {/* Inner pulsing shield */}
              <div className="absolute w-12 h-12 bg-primary-soft rounded-full flex items-center justify-center animate-pulse">
                <Loader className="w-6 h-6 text-primary animate-spin-slow" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-text-primary">
                Verifying Your Account
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                Please wait a moment while we secure and verify your email address.
              </p>
            </div>
          </div>
        )}

        {/* Verification Status: Success */}
        {status === "success" && (
          <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in zoom-in duration-300">
            <div className="relative flex items-center justify-center">
              {/* Decorative radial pulse */}
              <div className="absolute w-24 h-24 bg-emerald-500/20 rounded-full animate-ping duration-1000" />
              <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center relative z-10">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-emerald-500">
                Verification Successful!
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                Your email has been verified. Welcome to your new workspace!
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-xs font-semibold text-emerald-500 mt-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Redirecting to Workspace...
              </div>
            </div>
          </div>
        )}

        {/* Verification Status: Error */}
        {status === "error" && (
          <div className="flex flex-col items-center gap-6 py-2 animate-in fade-in zoom-in duration-300">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 bg-rose-500/10 border-2 border-rose-500/30 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-rose-500" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black tracking-tight text-rose-500">
                Verification Failed
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                This verification link is invalid, expired, or has already been used to verify this account.
              </p>
            </div>
            <div className="w-full pt-4 space-y-2">
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm shadow-lg shadow-primary/25 cursor-pointer"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;

