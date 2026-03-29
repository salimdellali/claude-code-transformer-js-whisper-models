"use client";

import type { HistoryEntry, ModelId } from "@/types";
import DiffText from "@/components/DiffText";

const MODEL_IDS: ModelId[] = [
  "Xenova/whisper-tiny",
  "Xenova/whisper-base",
  "Xenova/whisper-small",
];

const MODEL_LABELS: Record<ModelId, string> = {
  "Xenova/whisper-tiny": "whisper-tiny",
  "Xenova/whisper-base": "whisper-base",
  "Xenova/whisper-small": "whisper-small",
};

function fmt(ms: number | null): string {
  if (ms === null) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

interface Props {
  entries: HistoryEntry[];
  onDelete: (id: string) => void;
}

export default function HistoryTable({ entries, onDelete }: Readonly<Props>) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
        History
      </h2>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-600 italic">
          No transcription history yet. Perform your first transcription to save
          the results.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800 text-xs text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 font-medium">Original text</th>
                {MODEL_IDS.map((id) => (
                  <th key={id} className="px-4 py-3 font-medium">
                    {MODEL_LABELS[id]}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {entries.map((entry) => (
                <tr key={entry.id} className="bg-gray-900 hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 align-top text-gray-300 max-w-45">
                    {entry.referenceText.trim() || (
                      <span className="text-gray-600 italic">—</span>
                    )}
                  </td>
                  {MODEL_IDS.map((modelId) => {
                    const result = entry.results[modelId];
                    return (
                      <td key={modelId} className="px-4 py-3 align-top max-w-55">
                        {result ? (
                          <>
                            {entry.referenceText.trim() ? (
                              <DiffText
                                reference={entry.referenceText}
                                hypothesis={result.transcription}
                              />
                            ) : (
                              <p className="text-sm text-gray-200 leading-relaxed">
                                {result.transcription}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {fmt(result.inferenceTime)}
                            </p>
                          </>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 align-top">
                    <button
                      onClick={() => onDelete(entry.id)}
                      aria-label="Delete entry"
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3H9zm0 5h2v9H9V8zm4 0h2v9h-2V8z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
