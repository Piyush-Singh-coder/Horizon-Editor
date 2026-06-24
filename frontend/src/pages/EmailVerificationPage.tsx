import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Loader, CheckCircle, XCircle, Mail } from "lucide-react";

const EmailVerificationPage = () => {
  const { token } = useParams<{ token: string }>();
  const { verifyEmail } = useAuthStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");

  const handleVerify = async () => {
    if (!token) {
      setStatus("error");
      return;
    }
    setStatus("verifying");
    try {
      await verifyEmail(token);
      setStatus("success");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-bg-primary p-4 transition-colors duration-300">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-primary/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full bg-bg-secondary border border-border-primary rounded-2xl shadow-xl p-6 sm:p-8 text-center relative z-10 transition-all duration-300">
        {status === "idle" && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-primary-soft border border-primary/20 rounded-full flex items-center justify-center animate-bounce">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text">Verify Your Email</h2>
              <p className="text-sm text-text-muted">
                Click the button below to complete your email verification and unlock your workspace.
              </p>
            </div>
            <button
              onClick={handleVerify}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm shadow-lg shadow-primary/20 cursor-pointer mt-2"
            >
              Verify Email
            </button>
          </div>
        )}

        {status === "verifying" && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-primary-soft border border-primary/20 rounded-full flex items-center justify-center">
              <Loader className="w-7 h-7 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text">Verifying...</h2>
              <p className="text-sm text-text-muted">
                Please wait while we verify your email address.
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-emerald-500">Email Verified!</h2>
              <p className="text-sm text-text-muted">
                Redirecting you to the workspace home page...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center">
              <XCircle className="w-7 h-7 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-rose-500 font-extrabold">Verification Failed</h2>
              <p className="text-sm text-text-muted">
                The verification link is invalid, expired, or has already been used.
              </p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm shadow-lg shadow-primary/20 cursor-pointer mt-2"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
