"use client";

import type { ModelId, ModelState } from "@/types";

interface Props {
  modelStates: Record<ModelId, ModelState>;
}

const MODEL_SIZES: Record<ModelId, string> = {
  "Xenova/whisper-tiny": "~75 MB",
  "Xenova/whisper-base": "~145 MB",
  "Xenova/whisper-small": "~466 MB",
};

const MODEL_LABELS: Record<ModelId, string> = {
  "Xenova/whisper-tiny": "whisper-tiny",
  "Xenova/whisper-base": "whisper-base",
  "Xenova/whisper-small": "whisper-small",
};

export default function DownloadPanel({ modelStates }: Props) {
  const entries = Object.entries(modelStates) as [ModelId, ModelState][];
  const allSettled = entries.every(
    ([, s]) => s.status !== "idle" && s.status !== "downloading"
  );
  const anyError = entries.some(([, s]) => s.status === "error");

  // Hide once everything is loaded (and there are no errors to show)
  if (allSettled && !anyError) return null;

  return (
    <div className="w-full rounded-xl bg-gray-800 border border-gray-700 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
        Downloading models…
      </h2>
      {entries.map(([modelId, state]) => (
        <div key={modelId}>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>
              {MODEL_LABELS[modelId]}{" "}
              <span className="text-gray-600">{MODEL_SIZES[modelId]}</span>
            </span>
            <span>
              {state.status === "error"
                ? "✗ Error"
                : state.status === "ready" || state.status === "transcribing" || state.status === "done"
                ? state.downloadTime != null
                  ? `✓ ${(state.downloadTime / 1000).toFixed(1)}s`
                  : "✓ Cached"
                : state.status === "downloading"
                ? `${Math.round(state.downloadProgress)}%`
                : "Queued"}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                state.status === "error"
                  ? "bg-red-500"
                  : state.status === "ready" || state.status === "transcribing" || state.status === "done"
                  ? "bg-green-500"
                  : "bg-blue-500"
              }`}
              style={{
                width:
                  state.status === "error" ||
                  state.status === "ready" ||
                  state.status === "transcribing" ||
                  state.status === "done"
                    ? "100%"
                    : `${state.downloadProgress}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
