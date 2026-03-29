"use client";

import type { MicPermissionState } from "@/types";

interface Props {
  permission: MicPermissionState;
  onRequestPermission: () => void;
}

const MicIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-3 h-3"
  >
    <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1.5 16.93A8.001 8.001 0 0 1 4 11H2a10 10 0 0 0 9 9.95V23h2v-2.05A10 10 0 0 0 22 11h-2a8.001 8.001 0 0 1-6.5 6.93V17h-3v.93z" />
  </svg>
);

const MicBlockedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-3 h-3"
  >
    <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1.5 16.93A8.001 8.001 0 0 1 4 11H2a10 10 0 0 0 9 9.95V23h2v-2.05A10 10 0 0 0 22 11h-2a8.001 8.001 0 0 1-6.5 6.93V17h-3v.93z" />
    <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const config: Record<
  Exclude<MicPermissionState, "unsupported">,
  { label: string; className: string; icon: React.ReactNode; clickable: boolean }
> = {
  prompt: {
    label: "Allow mic",
    className: "bg-gray-700 text-gray-400 hover:bg-gray-600 cursor-pointer",
    icon: <MicIcon />,
    clickable: true,
  },
  granted: {
    label: "Mic on",
    className: "bg-green-900 text-green-300",
    icon: <MicIcon />,
    clickable: false,
  },
  denied: {
    label: "Mic blocked",
    className: "bg-red-900 text-red-300",
    icon: <MicBlockedIcon />,
    clickable: false,
  },
};

export default function MicPermissionBadge({ permission, onRequestPermission }: Props) {
  if (permission === "unsupported") return null;

  const { label, className, icon, clickable } = config[permission];
  const pillClass = `inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${className}`;

  if (clickable) {
    return (
      <button
        className={pillClass}
        onClick={onRequestPermission}
        aria-label="Grant microphone permission"
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <span className={pillClass} role="status">
      {icon}
      {label}
    </span>
  );
}
