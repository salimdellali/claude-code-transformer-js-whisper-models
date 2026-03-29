"use client";

interface Props {
  reference: string;
  hypothesis: string;
}

export default function DiffText({ reference, hypothesis }: Props) {
  const refWords = reference
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const hypWords = hypothesis.split(/\s+/).filter(Boolean);

  return (
    <p className="text-sm text-gray-200 leading-relaxed">
      {hypWords.map((word, i) => {
        const clean = word.toLowerCase().replace(/[^\w]/g, "");
        const match = refWords.some((r) => r === clean);
        return (
          <span key={i} className={match ? "" : "text-red-400 underline"}>
            {word}
            {i < hypWords.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}
