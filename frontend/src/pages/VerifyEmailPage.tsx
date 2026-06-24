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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-bg-primary p-4 transition-colors duration-300">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-primary/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full bg-bg-secondary border border-border-primary rounded-2xl shadow-xl overflow-hidden relative z-10 transition-all duration-300">
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-primary-soft border border-primary/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <Mail className="w-7 h-7 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text">
              Check Your Email
            </h1>
            <p className="text-sm text-text-muted">
              We've sent a verification link to{" "}
              <span className="font-semibold text-text-secondary">
                {user?.email || "your email"}
              </span>
              . Click the link in the email to activate your account.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleCheckVerification}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm shadow-lg shadow-primary/20 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              I've Verified My Email
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-bg-tertiary hover:bg-bg-primary border border-border-primary text-text-secondary font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>

        <div className="bg-bg-tertiary/50 border-t border-border-primary p-4 text-center text-xs text-text-muted">
          Did not receive the email? Check your spam folder.
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
