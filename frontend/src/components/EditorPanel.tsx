import { useEffect } from "react";
import { useCodeEditorStore } from "../store/codeEditorStore";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "../lib/language";
import { Editor } from "@monaco-editor/react";

const EditorPanel = () => {
  const { language, theme, fontSize, editor, setEditor } = useCodeEditorStore();

  useEffect(() => {
    // We might still want to load the code here or in the parent.
    // Keeping it here makes sense for the "editor" responsibility.
    if (editor) {
      const savedCode = localStorage.getItem(`editor-code-${language}`);
      const defaultCode =
        LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG].defaultCode;
      editor.setValue(savedCode || defaultCode);
    }
  }, [language, editor]);

  const handleEditorChange = (value: string | undefined) => {
    if (value) localStorage.setItem(`editor-code-${language}`, value);
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-bg-secondary border border-border-primary shadow-xl flex flex-col transition-all duration-300">
      {/* Editor Window Chrome Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-bg-tertiary/40 border-b border-border-primary/50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <div className="text-[10px] tracking-widest font-extrabold uppercase text-text-muted flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          {LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG].monacoLanguage} editor
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          language={
            LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG]
              .monacoLanguage
          }
          defaultValue={
            LANGUAGE_CONFIG[language as keyof typeof LANGUAGE_CONFIG].defaultCode
          }
          onChange={handleEditorChange}
          theme={theme}
          beforeMount={defineMonacoThemes}
          onMount={(editor) => {
            setEditor(editor);
            const savedCode = localStorage.getItem(`editor-code-${language}`);
            if (savedCode) editor.setValue(savedCode);
          }}
          options={{
            minimap: { enabled: false },
            fontSize,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            renderWhitespace: "selection",
            fontFamily: '"JetBrains Mono", Consolas, monospace',
            fontLigatures: true,
            cursorBlinking: "smooth",
            smoothScrolling: true,
            renderLineHighlight: "all",
          }}
        />
      </div>
    </div>
  );
};

export default EditorPanel;
