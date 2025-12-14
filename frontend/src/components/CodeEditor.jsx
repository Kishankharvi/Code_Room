import Editor from "@monaco-editor/react";

export default function CodeEditor({
  language,
  value,
  readOnly,
  onChange,
  onRun,
}) {
  return (
    <div className="h-full flex flex-col">
      <Editor
        height="100%"
        language={language}
        value={value}
        options={{ readOnly, minimap: { enabled: false }, fontSize: 14 }}
        onChange={(val) => onChange(val)}
      />

      <button
        onClick={onRun}
        className="mt-2 bg-brand-blue text-white py-2 rounded-xl hover:bg-brand-blueDark transition"
      >
        Run Code
      </button>
    </div>
  );
}
