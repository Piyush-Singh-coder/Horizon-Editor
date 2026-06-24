import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export interface Execution {
  _id: string;
  code: string;
  language: string;
  output: string;
  createdAt: string;
}

interface ExecutionStore {
  executions: Execution[];
  isLoading: boolean;
  error: string | null;

  fetchExecutions: () => Promise<void>;
  saveExecution: (data: {
    language: string;
    code: string;
    output: string;
  }) => Promise<void>;
  fetchExecution: (id: string) => Promise<void>;
  deleteExecution: (id: string) => Promise<void>;
}

export const useExecutionStore = create<ExecutionStore>((set, get) => ({
  executions: [],
  isLoading: false,
  error: null,

  fetchExecutions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/execution");
      set({ executions: response.data.executions, isLoading: false });
    } catch (error: any) {
      console.error("Error fetching executions:", error);
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch executions",
      });
      toast.error("Failed to fetch executions");
    }
  },

  fetchExecution: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/execution/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching execution:", error);
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch execution",
      });
      toast.error("Failed to fetch execution");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  saveExecution: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.post("/execution", data);
      toast.success("Execution saved successfully");
      await get().fetchExecutions(); // Refresh list
    } catch (error: any) {
      console.error("Error saving execution:", error);
      toast.error(error.response?.data?.message || "Failed to save execution");
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to save execution",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteExecution: async (id) => {
    try {
      await axiosInstance.delete(`/execution/${id}`);
      set((state) => ({
        executions: state.executions.filter((e) => e._id !== id),
      }));
      toast.success("Execution deleted successfully");
    } catch (error: any) {
      console.error("Error deleting execution:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete execution"
      );
    }
  },
}));
