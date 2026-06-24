import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";

export interface Snippet {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  title: string;
  language: string;
  code: string;
  stars: string[]; // User IDs
  comments: {
    _id: string;
    user: {
      _id: string;
      fullName: string;
    };
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
}

interface SnippetStore {
  snippets: Snippet[];
  isCreating: boolean;
  loading: boolean;
  createSnippet: (data: {
    title: string;
    language: string;
    code: string;
  }) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;
  fetchSnippets: () => Promise<void>;
  toggleStar: (snippetId: string) => Promise<void>;
  addComment: (snippetId: string, text: string) => Promise<void>;
}

export const useSnippetStore = create<SnippetStore>((set, get) => ({
  snippets: [],
  isCreating: false,
  loading: false,

  addComment: async (snippetId, text) => {
    try {
      const response = await axiosInstance.post(
        `/snippets/comment/${snippetId}`,
        {
          text,
        }
      );
      set((state) => ({
        snippets: state.snippets.map((s) => {
          if (s._id === snippetId) {
            return { ...s, comments: response.data.comments };
          }
          return s;
        }),
      }));
      toast.success("Comment added successfully");
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(error.response?.data?.message || "Failed to add comment");
      throw error;
    }
  },

  createSnippet: async (data) => {
    set({ isCreating: true });
    try {
      await axiosInstance.post("/snippets", data);
      toast.success("Snippet created successfully");
      await get().fetchSnippets();
    } catch (error: any) {
      console.error("Error creating snippet:", error);
      toast.error(error.response?.data?.message || "Failed to create snippet");
      throw error;
    } finally {
      set({ isCreating: false });
    }
  },

  deleteSnippet: async (id) => {
    try {
      await axiosInstance.delete(`/snippets/${id}`);
      set((state) => ({
        snippets: state.snippets.filter((s) => s._id !== id),
      }));
      toast.success("Snippet deleted successfully");
    } catch (error: any) {
      console.error("Error deleting snippet:", error);
      toast.error(error.response?.data?.message || "Failed to delete snippet");
      throw error;
    }
  },

  fetchSnippets: async () => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/snippets/all");
      set({ snippets: response.data.snippets });
    } catch (error: any) {
      console.error("Error fetching snippets:", error);
      toast.error(error.response?.data?.message || "Failed to fetch snippets");
    } finally {
      set({ loading: false });
    }
  },

  toggleStar: async (snippetId) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      toast.error("You must be logged in to star a snippet");
      return;
    }

    // Optimistic Update
    set((state) => ({
      snippets: state.snippets.map((s) => {
        if (s._id === snippetId) {
          const isStarred = s.stars.includes(user._id);
          return {
            ...s,
            stars: isStarred
              ? s.stars.filter((id) => id !== user._id)
              : [...s.stars, user._id],
          };
        }
        return s;
      }),
    }));

    try {
      await axiosInstance.post(`/snippets/star/${snippetId}`);
      // No need to refetch if optimistic update succeeds, but we can to be safe eventually.
      // For now, let's keep it fast.
    } catch (error: any) {
      console.error("Error starring snippet:", error);
      toast.error(error.response?.data?.message || "Failed to star snippet");
      // Revert optimism on error
      await get().fetchSnippets();
    }
  },
}));
