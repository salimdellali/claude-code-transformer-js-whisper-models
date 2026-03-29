"use client";

import MicPermissionBadge from "@/components/MicPermissionBadge";
import type { MicPermissionState } from "@/types";

interface Props {
  micPermission: MicPermissionState;
  onRequestMicPermission: () => void;
}

export default function SettingsBar({ micPermission, onRequestMicPermission }: Readonly<Props>) {
  return (
    <div className="flex items-center justify-end gap-3">
      <MicPermissionBadge
        permission={micPermission}
        onRequestPermission={onRequestMicPermission}
      />
    </div>
  );
}
