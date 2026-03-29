"use client";

import { useState, useEffect, useCallback } from "react";
import type { MicPermissionState } from "@/types";

export function useMicPermission(): {
  permission: MicPermissionState;
  requestPermission: () => Promise<void>;
  reportGranted: () => void;
  reportDenied: () => void;
} {
  const [permission, setPermission] = useState<MicPermissionState>("prompt");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions) {
      setPermission("unsupported");
      return;
    }

    let cleanup: (() => void) | undefined;

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((result) => {
        setPermission(result.state as MicPermissionState);

        const onChange = () => setPermission(result.state as MicPermissionState);
        result.addEventListener("change", onChange);
        cleanup = () => result.removeEventListener("change", onChange);
      })
      .catch(() => {
        setPermission("unsupported");
      });

    return () => cleanup?.();
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermission("granted");
    } catch {
      setPermission("denied");
    }
  }, []);

  const reportGranted = useCallback(() => setPermission("granted"), []);
  const reportDenied = useCallback(() => setPermission("denied"), []);

  return { permission, requestPermission, reportGranted, reportDenied };
}
