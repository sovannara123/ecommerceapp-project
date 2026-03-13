import { STORAGE_KEYS } from "@/shared/constants/storage";

function makeDeviceId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `web-${crypto.randomUUID()}`;
  }
  return `web-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function getOrCreateDeviceId() {
  if (typeof window === "undefined") return "server-device";
  const existing = window.localStorage.getItem(STORAGE_KEYS.deviceId);
  if (existing) return existing;
  const next = makeDeviceId();
  window.localStorage.setItem(STORAGE_KEYS.deviceId, next);
  return next;
}
