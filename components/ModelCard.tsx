"use client";

import type { ModelId, ModelState } from "@/types";
import DiffText from "@/components/DiffText";

interface Props {
  modelId: ModelId;
  state: ModelState;
  referenceText: string;
}

const MODEL_LABELS: Record<ModelId, string> = {
  "Xenova/whisper-tiny": "whisper-tiny",
  "Xenova/whisper-base": "whisper-base",
  "Xenova/whisper-small": "whisper-small",
};

const MODEL_SIZES: Record<ModelId, string> = {
  "Xenova/whisper-tiny": "39M params",
  "Xenova/whisper-base": "74M params",
  "Xenova/whisper-small": "244M params",
};

function fmt(ms: number | null): string {
  if (ms === null) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}


export default function ModelCard({ modelId, state, referenceText }: Props) {
  const isActive = state.status === "transcribing";
  const isDone = state.status === "done";
  const isDownloading = state.status === "downloading" || state.status === "idle";

  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-4 transition-all ${
        isActive
          ? "border-blue-500 bg-gray-800 shadow-lg shadow-blue-500/10"
          : isDone
          ? "border-gray-600 bg-gray-800"
          : "border-gray-700 bg-gray-900 opacity-60"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-mono font-semibold text-white text-base">
            {MODEL_LABELS[modelId]}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{MODEL_SIZES[modelId]}</p>
        </div>
        <StatusBadge status={state.status} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Metric
          label="Download"
          value={
            isDownloading
              ? state.downloadProgress > 0
                ? `${Math.round(state.downloadProgress)}%`
                : "—"
              : state.downloadTime === 0
              ? "Cached"
              : fmt(state.downloadTime)
          }
        />
        <Metric
          label="Inference"
          value={state.status === "transcribing" ? "…" : fmt(state.inferenceTime)}
        />
        <Metric
          label="WER"
          value={
            state.wer === null
              ? "—"
              : `${(state.wer * 100).toFixed(1)}%`
          }
          highlight={
            state.wer !== null
              ? state.wer === 0
                ? "green"
                : state.wer < 0.1
                ? "yellow"
                : "red"
              : undefined
          }
        />
        <Metric
          label="Similarity"
          value={
            state.charSimilarity === null
              ? "—"
              : `${(state.charSimilarity * 100).toFixed(1)}%`
          }
          highlight={
            state.charSimilarity !== null
              ? state.charSimilarity > 0.9
                ? "green"
                : state.charSimilarity > 0.7
                ? "yellow"
                : "red"
              : undefined
          }
        />
      </div>

      {/* Transcription output */}
      <div className="min-h-16 rounded-lg bg-gray-900 border border-gray-700 p-3">
        {state.status === "transcribing" && (
          <p className="text-xs text-blue-400 animate-pulse">Transcribing…</p>
        )}
        {isDone && state.transcription ? (
          referenceText.trim() ? (
            <DiffText
              reference={referenceText}
              hypothesis={state.transcription}
            />
          ) : (
            <p className="text-sm text-gray-200">{state.transcription}</p>
          )
        ) : null}
        {state.error && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}
        {!isDone && state.status !== "transcribing" && !state.error && (
          <p className="text-xs text-gray-600 italic">Output will appear here</p>
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "green" | "yellow" | "red";
}) {
  const color =
    highlight === "green"
      ? "text-green-400"
      : highlight === "yellow"
      ? "text-yellow-400"
      : highlight === "red"
      ? "text-red-400"
      : "text-gray-300";

  return (
    <div className="bg-gray-900 rounded-lg px-3 py-2">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm font-mono font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ModelState["status"] }) {
  const map: Record<
    ModelState["status"],
    { label: string; className: string }
  > = {
    idle: { label: "Queued", className: "bg-gray-700 text-gray-400" },
    downloading: {
      label: "Downloading",
      className: "bg-blue-900 text-blue-300",
    },
    ready: { label: "Ready", className: "bg-green-900 text-green-300" },
    transcribing: {
      label: "Transcribing",
      className: "bg-yellow-900 text-yellow-300 animate-pulse",
    },
    done: { label: "Done", className: "bg-green-900 text-green-300" },
    error: { label: "Error", className: "bg-red-900 text-red-300" },
  };

  const { label, className } = map[status];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${className}`}>
      {label}
    </span>
  );
}
