"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function ReferenceInput({ value, onChange, disabled }: Props) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Reference Text{" "}
        <span className="text-gray-500 font-normal">
          (type what you will say)
        </span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={3}
        placeholder="E.g. The quick brown fox jumps over the lazy dog..."
        className="w-full rounded-lg bg-gray-800 border border-gray-700 text-gray-100 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600 disabled:opacity-50"
      />
    </div>
  );
}
