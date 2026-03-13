import { useSyncExternalStore } from "react";

/**
 * In-memory auth token store.
 * Access token lives only in JS memory — never persisted to disk.
 * Refresh token is handled via HttpOnly cookie (auto-sent by browser).
 */
let accessToken: string | null = null;
const listeners = new Set<() => void>();

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  listeners.forEach((listener) => listener());
};

export const clearAccessToken = () => {
  setAccessToken(null);
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAccessToken() {
  return useSyncExternalStore(subscribe, getAccessToken, getAccessToken);
}
