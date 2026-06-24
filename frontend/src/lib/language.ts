export const LANGUAGE_CONFIG = {
  javascript: {
    id: "javascript",
    label: "JavaScript",
    logoPath: "/javascript.png",
    judge0Id: 93, // JavaScript (Node.js 18.15.0)
    monacoLanguage: "javascript",
    defaultCode: `// JavaScript Boilerplate
// Start writing your logic below

function main() {
  // your code here
}

main();`,
  },

  typescript: {
    id: "typescript",
    label: "TypeScript",
    logoPath: "/typescript.png",
    judge0Id: 94, // TypeScript (5.0.3)
    monacoLanguage: "typescript",
    defaultCode: `// TypeScript Boilerplate
// Start writing your logic below

function main(): void {
  // your code here
}

main();`,
  },

  python: {
    id: "python",
    label: "Python",
    logoPath: "/python.png",
    judge0Id: 92, // Python (3.11.2)
    monacoLanguage: "python",
    defaultCode: `# Python Boilerplate
# Start writing your logic below

def main():
    pass


if __name__ == "__main__":
    main()`,
  },

  java: {
    id: "java",
    label: "Java",
    logoPath: "/java.png",
    judge0Id: 91, // Java (JDK 17.0.6)
    monacoLanguage: "java",
    defaultCode: `public class Main {

    public static void main(String[] args) {
        // Start writing your logic here
    }

}`,
  },

  go: {
    id: "go",
    label: "Go",
    logoPath: "/go.png",
    judge0Id: 95, // Go (1.18.5)
    monacoLanguage: "go",
    defaultCode: `package main

import "fmt"

func main() {
    // Start writing your logic here
    fmt.Println("Hello, World!")
}`,
  },

  rust: {
    id: "rust",
    label: "Rust",
    logoPath: "/rust.png",
    judge0Id: 73, // Rust (1.40.0)
    monacoLanguage: "rust",
    defaultCode: `fn main() {
    // Start writing your logic here
}`,
  },

  cpp: {
    id: "cpp",
    label: "C++",
    logoPath: "/cpp.png",
    judge0Id: 54, // C++ (GCC 9.2.0)
    monacoLanguage: "cpp",
    defaultCode: `#include <iostream>

int main() {
    // Start writing your logic here
    return 0;
}`,
  },

  csharp: {
    id: "csharp",
    label: "C#",
    logoPath: "/csharp.png",
    judge0Id: 51, // C# (Mono 6.6.0.161)
    monacoLanguage: "csharp",
    defaultCode: `using System;

class Program
{
    static void Main(string[] args)
    {
        // Start writing your logic here
    }
}`,
  },

  ruby: {
    id: "ruby",
    label: "Ruby",
    logoPath: "/ruby.png",
    judge0Id: 72, // Ruby (2.7.0)
    monacoLanguage: "ruby",
    defaultCode: `# Ruby Boilerplate
# Start writing your logic below

def main
  # your code here
end

main`,
  },

  swift: {
    id: "swift",
    label: "Swift",
    logoPath: "/swift.png",
    judge0Id: 83, // Swift (5.2.3)
    monacoLanguage: "swift",
    defaultCode: `// Swift Boilerplate
// Start writing your logic below

func main() {
    // your code here
}

main()`,
  },
};

export const THEMES = [
  { id: "vs-dark", label: "VS Dark", color: "#1e1e1e" },
  { id: "vs-light", label: "VS Light", color: "#ffffff" },
  { id: "github-dark", label: "GitHub Dark", color: "#0d1117" },
  { id: "monokai", label: "Monokai", color: "#272822" },
  { id: "solarized-dark", label: "Solarized Dark", color: "#002b36" },
];

export const THEME_DEFINITIONS = {
  "github-dark": {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6e7681" },
      { token: "string", foreground: "a5d6ff" },
      { token: "keyword", foreground: "ff7b72" },
      { token: "number", foreground: "79c0ff" },
      { token: "type", foreground: "ffa657" },
      { token: "class", foreground: "ffa657" },
      { token: "function", foreground: "d2a8ff" },
      { token: "variable", foreground: "ffa657" },
      { token: "operator", foreground: "ff7b72" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#c9d1d9",
      "editor.lineHighlightBackground": "#161b22",
      "editorLineNumber.foreground": "#6e7681",
      "editorIndentGuide.background": "#21262d",
      "editor.selectionBackground": "#264f78",
      "editor.inactiveSelectionBackground": "#264f7855",
    },
  },

  monokai: {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "75715E" },
      { token: "string", foreground: "E6DB74" },
      { token: "keyword", foreground: "F92672" },
      { token: "number", foreground: "AE81FF" },
      { token: "type", foreground: "66D9EF" },
      { token: "class", foreground: "A6E22E" },
      { token: "function", foreground: "A6E22E" },
      { token: "variable", foreground: "F8F8F2" },
      { token: "operator", foreground: "F92672" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#F8F8F2",
      "editorLineNumber.foreground": "#75715E",
      "editor.selectionBackground": "#49483E",
      "editor.lineHighlightBackground": "#3E3D32",
      "editorCursor.foreground": "#F8F8F2",
      "editor.selectionHighlightBackground": "#49483E",
    },
  },

  "solarized-dark": {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "586e75" },
      { token: "string", foreground: "2aa198" },
      { token: "keyword", foreground: "859900" },
      { token: "number", foreground: "d33682" },
      { token: "type", foreground: "b58900" },
      { token: "class", foreground: "b58900" },
      { token: "function", foreground: "268bd2" },
      { token: "variable", foreground: "b58900" },
      { token: "operator", foreground: "859900" },
    ],
    colors: {
      "editor.background": "#002b36",
      "editor.foreground": "#839496",
      "editorLineNumber.foreground": "#586e75",
      "editor.selectionBackground": "#073642",
      "editor.lineHighlightBackground": "#073642",
      "editorCursor.foreground": "#839496",
      "editor.selectionHighlightBackground": "#073642",
    },
  },
};

// Helper function to define themes in Monaco
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defineMonacoThemes = (monaco: any) => {
  Object.entries(THEME_DEFINITIONS).forEach(
    ([themeName, themeData]: [string, any]) => {
      monaco.editor.defineTheme(themeName, {
        base: themeData.base,
        inherit: themeData.inherit,
        rules: themeData.rules,
        colors: themeData.colors,
      });
    },
  );
};
