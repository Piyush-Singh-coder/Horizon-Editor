import { create } from "zustand";
import { LANGUAGE_CONFIG } from "../lib/language";
import { axiosInstance } from "../lib/axios";

interface CodeEditorState {
  language: string;
  theme: string;
  fontSize: number;
  output: string;
  isRunning: boolean;
  error: string | null;
  code: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any;

  setLanguage: (language: string) => void;
  setTheme: (theme: string) => void;
  setFontSize: (fontSize: number) => void;
  setOutput: (output: string) => void;
  setIsRunning: (isRunning: boolean) => void;
  setError: (error: string | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setEditor: (editor: any) => void;

  // Computed/Derived
  getCode: () => string;
  setCode: (code: string) => void;
  runCode: () => Promise<void>;
}

const getInitialState = () => {
  // if we save to local storage, we can retrieve it here
  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = parseInt(
    localStorage.getItem("editor-font-size") || "16",
  );

  return {
    language: savedLanguage,
    theme: savedTheme,
    fontSize: savedFontSize,
  };
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    editor: null,

    // We will hold the code state in the editor component mostly,
    // but if we want to persist specific code per language we can do it here.
    // For now, let's just allow setting standard preferences.
    code: LANGUAGE_CONFIG[initialState.language as keyof typeof LANGUAGE_CONFIG]
      .defaultCode, // Initial code

    getCode: () => get().code,

    setCode: (code: string) => {
      // This might be redundant if Monaco handles its own state,
      // but useful if we want to run code from the store.
      set({ code });
    },

    setEditor: (editor: any) => {
      set({ editor });
    },

    runCode: async () => {
      const { language, code, editor } = get();
      set({ isRunning: true, error: null, output: "" });

      try {
        const languageConfig =
          LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG];
        const languageId = languageConfig.judge0Id;
        const sourceCode = editor ? editor.getValue() : code;

        const response = await axiosInstance.post("/execution/execute", {
          languageId,
          code: sourceCode,
        });

        set({
          output: response.data.output || "",
          error: response.data.error || null,
          isRunning: false,
        });
        console.log(response.data);
      } catch (error: any) {
        console.error("Error executing code:", error);

        // Handle Rate Limiting
        if (error.response?.status === 429) {
          set({ isRunning: false, error: null }); // Stop spinner
          window.location.href = "/rate-limit"; // Force redirect
          return;
        }

        set({
          error: error.message || "Error running code",
          output: "",
          isRunning: false,
        });
      }
    },

    setLanguage: (language: string) => {
      // Save current code to some cache if we wanted to preserve it per language
      const newCode =
        LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG].defaultCode; // Reset to default for now or load from cache

      localStorage.setItem("editor-language", language);

      set({
        language,
        code: newCode,
        output: "",
        error: null,
      });
    },

    setTheme: (theme: string) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },

    setOutput: (output: string) => set({ output }),
    setIsRunning: (isRunning: boolean) => set({ isRunning }),
    setError: (error: string | null) => set({ error }),
  };
});
