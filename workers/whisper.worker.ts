import { pipeline, env } from "@huggingface/transformers";
import type { ModelId, WorkerInbound, WorkerOutbound } from "@/types";

// Use browser cache (IndexedDB) — models are cached after first download
env.allowLocalModels = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pipelines = new Map<ModelId, any>();

function send(msg: WorkerOutbound) {
  globalThis.postMessage(msg);
}

async function loadModel(modelId: ModelId) {
  if (pipelines.has(modelId)) {
    send({ type: "MODEL_READY", modelId, downloadTime: 0 });
    return;
  }

  const start = performance.now();

  const transcriber = await pipeline(
    "automatic-speech-recognition",
    modelId,
    {
      progress_callback: (p: {
        status: string;
        progress?: number;
        loaded?: number;
        total?: number;
      }) => {
        if (p.status === "progress") {
          send({
            type: "DOWNLOAD_PROGRESS",
            modelId,
            progress: p.progress ?? 0,
            loaded: p.loaded ?? 0,
            total: p.total ?? 0,
          });
        }
      },
    }
  );

  pipelines.set(modelId, transcriber);
  send({ type: "MODEL_READY", modelId, downloadTime: performance.now() - start });
}

async function transcribe(modelId: ModelId, audioData: Float32Array) {
  const transcriber = pipelines.get(modelId);
  if (!transcriber) {
    send({ type: "ERROR", modelId, message: "Model not loaded" });
    return;
  }

  const start = performance.now();
  const result = await transcriber(audioData, {
    language: "english",
    task: "transcribe",
  });
  const inferenceTime = performance.now() - start;

  const text = Array.isArray(result)
    ? (result[0] as { text: string }).text
    : (result as { text: string }).text;

  send({ type: "TRANSCRIPTION_RESULT", modelId, text: text.trim(), inferenceTime });
}

globalThis.onmessage = async (event: MessageEvent<WorkerInbound>) => {
  const msg = event.data;
  try {
    if (msg.type === "LOAD_MODEL") {
      await loadModel(msg.modelId);
    } else if (msg.type === "TRANSCRIBE") {
      await transcribe(msg.modelId, msg.audioData);
    }
  } catch (err) {
    send({
      type: "ERROR",
      modelId: msg.modelId,
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
