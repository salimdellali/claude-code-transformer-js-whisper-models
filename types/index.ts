// These are ONNX-converted versions of the OpenAI Whisper models maintained
// by the transformers.js team. The original openai/whisper-* repos only contain
// PyTorch weights; browser inference requires ONNX files.
export const MODEL_IDS = [
  "Xenova/whisper-tiny",
  "Xenova/whisper-base",
  "Xenova/whisper-small",
] as const;

export type ModelId = (typeof MODEL_IDS)[number];

export type MicPermissionState = "prompt" | "granted" | "denied" | "unsupported";

export interface HistoryEntry {
  id: string;
  referenceText: string;
  results: Partial<
    Record<
      ModelId,
      {
        transcription: string;
        inferenceTime: number | null;
        wer: number | null;
        charSimilarity: number | null;
      }
    >
  >;
}

export type ModelStatus =
  | "idle"
  | "downloading"
  | "ready"
  | "transcribing"
  | "done"
  | "error";

export interface ModelState {
  status: ModelStatus;
  downloadProgress: number; // 0–100
  downloadTime: number | null; // ms
  inferenceTime: number | null; // ms
  transcription: string | null;
  wer: number | null;
  charSimilarity: number | null;
  error: string | null;
}

// Worker inbound messages
export type WorkerInbound =
  | { type: "LOAD_MODEL"; modelId: ModelId }
  | { type: "TRANSCRIBE"; modelId: ModelId; audioData: Float32Array };

// Worker outbound messages
export type WorkerOutbound =
  | {
      type: "DOWNLOAD_PROGRESS";
      modelId: ModelId;
      progress: number;
      loaded: number;
      total: number;
    }
  | { type: "MODEL_READY"; modelId: ModelId; downloadTime: number }
  | {
      type: "TRANSCRIPTION_RESULT";
      modelId: ModelId;
      text: string;
      inferenceTime: number;
    }
  | { type: "ERROR"; modelId: ModelId; message: string };
