import { Mail, LogOut, RefreshCw } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const VerifyEmailPage = () => {
  const { user, logout, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleCheckVerification = async () => {
    await checkAuth();
    if (user?.isVerified) {
      toast.success("Email verified successfully!");
      navigate("/");
    } else {
      toast.error("Email not verified yet. Please check your inbox.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-bg-primary p-4 relative overflow-hidden transition-colors duration-300">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-bg-secondary border-2 border-border-primary dark:border-border-primary/60 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative z-10 transition-all duration-300 backdrop-blur-sm">
        <div className="p-8 sm:p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-primary-soft border-2 border-primary/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <Mail className="w-9 h-9 text-primary" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-black tracking-tight text-text-primary">
              Verify Your Email
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              We've sent a verification link to{" "}
              <span className="font-semibold text-text-primary underline decoration-primary decoration-2 underline-offset-2">
                {user?.email || "your email"}
              </span>
              . Please check your inbox and click the link to activate your account.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleCheckVerification}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm shadow-lg shadow-primary/25 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              I've Verified My Email
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-bg-tertiary hover:bg-bg-primary border-2 border-border-primary text-text-primary font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-text-muted" />
              Log Out
            </button>
          </div>
        </div>

        <div className="bg-bg-tertiary/60 border-t-2 border-border-primary p-4 text-center text-xs font-semibold text-text-muted">
          Did not receive the email? Check your spam folder.
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

