"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}

export default function RecordButton({ onRecordingComplete, disabled }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startRecording = async () => {
    if (disabled || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.start();
      setIsRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      onRecordingComplete(blob);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    mediaRecorderRef.current.stop();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        disabled={disabled}
        className={`
          select-none touch-none w-28 h-28 rounded-full text-white font-semibold text-sm transition-all
          flex flex-col items-center justify-center gap-1 shadow-lg
          ${
            isRecording
              ? "bg-red-600 scale-110 shadow-red-600/40"
              : disabled
              ? "bg-gray-700 cursor-not-allowed opacity-50"
              : "bg-blue-600 hover:bg-blue-500 active:scale-95 cursor-pointer"
          }
        `}
      >
        {isRecording ? (
          <>
            <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
            <span>{elapsed}s</span>
            <span className="text-xs opacity-80">Release to stop</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1 17.93V21h-2v2h6v-2h-2v-2.07A9.001 9.001 0 0 0 21 11h-2a7 7 0 0 1-14 0H3a9.001 9.001 0 0 0 8 8.93z" />
            </svg>
            <span>Hold to record</span>
          </>
        )}
      </button>
      {disabled && (
        <p className="text-xs text-gray-500">Waiting for models to load…</p>
      )}
    </div>
  );
}
