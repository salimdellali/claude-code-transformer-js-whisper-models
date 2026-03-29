"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { MODEL_IDS, type ModelId, type ModelState, type WorkerOutbound } from "@/types";
import { blobToFloat32Array } from "@/lib/audio";
import { computeWER, computeCharSimilarity } from "@/lib/metrics";
import { useMicPermission } from "@/hooks/useMicPermission";
import ReferenceInput from "@/components/ReferenceInput";
import RecordButton from "@/components/RecordButton";
import ModelCard from "@/components/ModelCard";
import DownloadPanel from "@/components/DownloadPanel";
import SettingsBar from "@/components/SettingsBar";

const initialModelState = (): ModelState => ({
  status: "idle",
  downloadProgress: 0,
  downloadTime: null,
  inferenceTime: null,
  transcription: null,
  wer: null,
  charSimilarity: null,
  error: null,
});

type State = {
  referenceText: string;
  isTranscribing: boolean;
  modelStates: Record<ModelId, ModelState>;
};

type Action =
  | { type: "SET_REFERENCE"; text: string }
  | { type: "SET_TRANSCRIBING"; value: boolean }
  | { type: "UPDATE_MODEL"; modelId: ModelId; patch: Partial<ModelState> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_REFERENCE":
      return { ...state, referenceText: action.text };
    case "SET_TRANSCRIBING":
      return { ...state, isTranscribing: action.value };
    case "UPDATE_MODEL":
      return {
        ...state,
        modelStates: {
          ...state.modelStates,
          [action.modelId]: {
            ...state.modelStates[action.modelId],
            ...action.patch,
          },
        },
      };
  }
}

const initialState: State = {
  referenceText: "",
  isTranscribing: false,
  modelStates: Object.fromEntries(
    MODEL_IDS.map((id) => [id, initialModelState()])
  ) as Record<ModelId, ModelState>,
};

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { permission: micPermission, requestPermission, reportGranted, reportDenied } = useMicPermission();
  const workerRef = useRef<Worker | null>(null);

  // Resolvers keyed by modelId — used to await MODEL_READY / TRANSCRIPTION_RESULT
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolversRef = useRef(new Map<string, { resolve: (v: any) => void; reject: (e: Error) => void }>());

  const updateModel = useCallback(
    (modelId: ModelId, patch: Partial<ModelState>) =>
      dispatch({ type: "UPDATE_MODEL", modelId, patch }),
    []
  );

  // Boot worker and load models sequentially on mount
  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/whisper.worker.ts", import.meta.url),
      { type: "module" }
    );
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerOutbound>) => {
      const msg = event.data;

      if (msg.type === "DOWNLOAD_PROGRESS") {
        updateModel(msg.modelId, {
          status: "downloading",
          downloadProgress: msg.progress,
        });
      } else if (msg.type === "MODEL_READY") {
        updateModel(msg.modelId, {
          status: "ready",
          downloadProgress: 100,
          downloadTime: msg.downloadTime,
        });
        resolversRef.current.get(`load:${msg.modelId}`)?.resolve(undefined);
        resolversRef.current.delete(`load:${msg.modelId}`);
      } else if (msg.type === "TRANSCRIPTION_RESULT") {
        resolversRef.current
          .get(`transcribe:${msg.modelId}`)
          ?.resolve({ text: msg.text, inferenceTime: msg.inferenceTime });
        resolversRef.current.delete(`transcribe:${msg.modelId}`);
      } else if (msg.type === "ERROR") {
        updateModel(msg.modelId, { status: "error", error: msg.message });
        resolversRef.current.get(`load:${msg.modelId}`)?.reject(new Error(msg.message));
        resolversRef.current.get(`transcribe:${msg.modelId}`)?.reject(new Error(msg.message));
        resolversRef.current.delete(`load:${msg.modelId}`);
        resolversRef.current.delete(`transcribe:${msg.modelId}`);
      }
    };

    // Load models sequentially: tiny → base → small
    (async () => {
      for (const modelId of MODEL_IDS) {
        try {
          await new Promise<void>((resolve, reject) => {
            resolversRef.current.set(`load:${modelId}`, { resolve, reject });
            worker.postMessage({ type: "LOAD_MODEL", modelId });
          });
        } catch {
          // Error already dispatched to state
        }
      }
    })();

    return () => worker.terminate();
  }, [updateModel]);

  // Enable recording once every model has finished loading (ready/done/error — not still downloading)
  const allModelsSettled = MODEL_IDS.every(
    (id) =>
      state.modelStates[id].status === "ready" ||
      state.modelStates[id].status === "done" ||
      state.modelStates[id].status === "error"
  );
  const atLeastOneReady = MODEL_IDS.some(
    (id) =>
      state.modelStates[id].status === "ready" ||
      state.modelStates[id].status === "done"
  );
  const allModelsReady = allModelsSettled && atLeastOneReady;

  const handleRecordingComplete = useCallback(
    async (blob: Blob) => {
      if (!workerRef.current || state.isTranscribing) return;
      dispatch({ type: "SET_TRANSCRIBING", value: true });

      let audioData: Float32Array;
      try {
        audioData = await blobToFloat32Array(blob);
      } catch (err) {
        console.error("Audio decode failed:", err);
        dispatch({ type: "SET_TRANSCRIBING", value: false });
        return;
      }

      const refText = state.referenceText.trim();

      for (const modelId of MODEL_IDS) {
        if (state.modelStates[modelId].status === "error") continue;

        updateModel(modelId, { status: "transcribing" });

        // Each model gets its own copy of the audio buffer since transferring
        // the buffer to a worker makes it detached and unusable for subsequent models
        const audioCopy = audioData.slice();

        try {
          const result = await new Promise<{
            text: string;
            inferenceTime: number;
          }>((resolve, reject) => {
            resolversRef.current.set(`transcribe:${modelId}`, { resolve, reject });
            workerRef.current!.postMessage(
              { type: "TRANSCRIBE", modelId, audioData: audioCopy },
              [audioCopy.buffer]
            );
          });

          updateModel(modelId, {
            status: "done",
            transcription: result.text,
            inferenceTime: result.inferenceTime,
            wer: refText ? computeWER(refText, result.text) : null,
            charSimilarity: refText ? computeCharSimilarity(refText, result.text) : null,
          });
        } catch (err) {
          updateModel(modelId, {
            status: "error",
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }

      dispatch({ type: "SET_TRANSCRIBING", value: false });
    },
    [state.isTranscribing, state.modelStates, state.referenceText, updateModel]
  );

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Whisper Model Benchmark
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Compare{" "}
              <span className="font-mono text-gray-300">whisper-tiny</span>,{" "}
              <span className="font-mono text-gray-300">whisper-base</span>, and{" "}
              <span className="font-mono text-gray-300">whisper-small</span> —
              transcription quality vs speed
            </p>
          </div>
          <SettingsBar
            micPermission={micPermission}
            onRequestMicPermission={requestPermission}
          />
        </div>

        {/* Download progress (hidden once all ready) */}
        <DownloadPanel modelStates={state.modelStates} />

        {/* Reference text + record */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex-1">
            <ReferenceInput
              value={state.referenceText}
              onChange={(text) => dispatch({ type: "SET_REFERENCE", text })}
              disabled={state.isTranscribing}
            />
            <p className="text-xs text-gray-600 mt-2">
              Providing reference text enables WER and similarity scoring.
            </p>
          </div>
          <div className="flex items-center justify-center pt-6">
            <RecordButton
              onRecordingComplete={handleRecordingComplete}
              disabled={!allModelsReady || state.isTranscribing}
              reportGranted={reportGranted}
              reportDenied={reportDenied}
            />
          </div>
        </div>

        {/* Model result cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODEL_IDS.map((modelId) => (
            <ModelCard
              key={modelId}
              modelId={modelId}
              state={state.modelStates[modelId]}
              referenceText={state.referenceText}
            />
          ))}
        </div>


      </div>
    </main>
  );
}
