import { create } from "zustand";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { axiosInstance } from "../lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

// User interface matching backend response
export interface User {
  _id: string;
  fullName: string;
  email: string;
  isVerified: boolean;
  createdAt?: string;
}

interface SignupData {
  fullName: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  isCheckingAuth: boolean;
  error: string | null;

  signup: (data: SignupData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggingIn: false,
  isSigningUp: false,
  isCheckingAuth: true,
  error: null,

  signup: async (data) => {
    set({ isSigningUp: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/register", data);
      set({ user: response.data, isSigningUp: false });
      toast.success("Account created successfully");
    } catch (error: unknown) {
      console.error("Error in signup", error);
      let errorMessage = "Error signing up";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      set({
        error: errorMessage,
        isSigningUp: false,
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/login", data);
      set({ user: response.data, isLoggingIn: false });
      // console.log(response.data);
      toast.success("Logged in successfully");
    } catch (error: unknown) {
      console.log("Error in login", error);
      let errorMessage = "Error logging in";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      set({
        error: errorMessage,
        isLoggingIn: false,
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ user: null, error: null });
      toast.success("Logged out successfully");
    } catch (error: unknown) {
      console.log("Error in logout", error);
      let errorMessage = "Error logging out";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  googleLogin: async () => {
    set({ isLoggingIn: true, error: null });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await axiosInstance.post("/auth/google-login", {
        idToken,
      });

      set({ user: response.data, isLoggingIn: false });
      toast.success("Logged in with Google successfully");
    } catch (error: unknown) {
      console.log("Error in googleLogin", error);
      let errorMessage = "Error logging in with Google";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      set({
        error: errorMessage,
        isLoggingIn: false,
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  verifyEmail: async (token) => {
    set({ isCheckingAuth: true, error: null });
    try {
      await axiosInstance.post(`/auth/verify`, { token });
      set({ isCheckingAuth: false });
      toast.success("Email verified successfully");
    } catch (error: unknown) {
      console.log("Error in verifyEmail", error);
      let errorMessage = "Error verifying email";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      set({ error: errorMessage, isCheckingAuth: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axiosInstance.get("/auth/profile");
      set({ user: response.data, isCheckingAuth: false });
    } catch (error: unknown) {
      console.log("Error in checkAuth", error);
      set({ isCheckingAuth: false, user: null });
    }
  },
}));
