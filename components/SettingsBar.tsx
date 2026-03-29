"use client";

import MicPermissionBadge from "@/components/MicPermissionBadge";
import type { MicPermissionState } from "@/types";

interface Props {
  micPermission: MicPermissionState;
  onRequestMicPermission: () => void;
  cacheSize: number | null;
  isClearing: boolean;
  modelsIdle: boolean;
  onClearCache: () => void;
  onDownloadModels: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb >= 1000
    ? `${(mb / 1024).toFixed(1)} GB`
    : `${Math.round(mb)} MB`;
}

export default function SettingsBar({
  micPermission,
  onRequestMicPermission,
  cacheSize,
  isClearing,
  modelsIdle,
  onClearCache,
  onDownloadModels,
}: Readonly<Props>) {
  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      <MicPermissionBadge
        permission={micPermission}
        onRequestPermission={onRequestMicPermission}
      />

      {modelsIdle ? (
        <button
          onClick={onDownloadModels}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-900 text-blue-300 hover:bg-blue-800 transition-colors cursor-pointer"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm-1 14.5v-5H8l4-5 4 5h-3v5h-2z" />
          </svg>
          Download models
        </button>
      ) : (
        <button
          onClick={onClearCache}
          disabled={isClearing || cacheSize === 0}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-gray-700 text-gray-400 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3H9zm0 5h2v9H9V8zm4 0h2v9h-2V8z" />
          </svg>
          {isClearing
            ? "Clearing…"
            : cacheSize === null
            ? "Clear cache"
            : cacheSize === 0
            ? "Cache empty"
            : `${formatBytes(cacheSize)} · Clear`}
        </button>
      )}
    </div>
  );
}
