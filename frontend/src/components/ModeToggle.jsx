export default function ModeToggle({ mode, canToggle, onToggle }) {
  return (
    <select
      value={mode}
      disabled={!canToggle}
      onChange={(e) => onToggle(e.target.value)}
      className="p-2 rounded-xl bg-white text-gray-700 border disabled:bg-gray-200"
    >
      <option value="interview">Interview</option>
      <option value="teaching">Teaching</option>
    </select>
  );
}
