import type { RefreshTokens } from "@/entities/auth/types";

type SessionSnapshot = {
  accessToken: string | null;
};

type SessionHandler = {
  get: () => SessionSnapshot;
  set: (tokens: RefreshTokens) => void;
  clear: () => void;
};

let handler: SessionHandler | null = null;

export function registerSessionHandler(next: SessionHandler) {
  handler = next;
}

export function getSessionSnapshot(): SessionSnapshot {
  return handler?.get() ?? { accessToken: null };
}

export function setSessionTokens(tokens: RefreshTokens) {
  handler?.set(tokens);
}

export function clearSession() {
  handler?.clear();
}
