import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import HomePage from "./pages/HomePage";
import SnippetPage from "./pages/SnippetPage";
import SnippetDetailPage from "./pages/SnippetDetailPage";
import ProfilePage from "./pages/ProfilePage";
import RateLimitPage from "./pages/RateLimitPage";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";

const App = () => {
  const { checkAuth, isCheckingAuth, user } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary font-sans text-text-primary transition-colors duration-300">
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            user ? (
              user.isVerified ? (
                <HomePage />
              ) : (
                <Navigate to="/verify-email" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/verify-email"
          element={
            user ? (
              !user.isVerified ? (
                <VerifyEmailPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/verify/:token" element={<EmailVerificationPage />} />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!user ? <SignupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/snippets"
          element={
            user ? (
              user.isVerified ? (
                <SnippetPage />
              ) : (
                <Navigate to="/verify-email" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/snippets/:id"
          element={
            user ? (
              user.isVerified ? (
                <SnippetDetailPage />
              ) : (
                <Navigate to="/verify-email" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            user ? (
              user.isVerified ? (
                <ProfilePage />
              ) : (
                <Navigate to="/verify-email" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/rate-limit" element={<RateLimitPage />} />
      </Routes>
      <Footer  />
      <Toaster />
    </div>
  );
};

export default App;
