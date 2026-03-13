import { useCallback, useEffect, useRef } from "react";
import { clearAccessToken, useAccessToken } from "../stores/authStore";
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll", "mousemove"];
export function useInactivityTimeout() {
    const accessToken = useAccessToken();
    const timerRef = useRef(null);
    const handleLogout = useCallback(() => {
        clearAccessToken();
        window.location.href = "/login?reason=session_expired";
    }, []);
    const resetTimer = useCallback(() => {
        if (timerRef.current)
            clearTimeout(timerRef.current);
        timerRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT_MS);
    }, [handleLogout]);
    useEffect(() => {
        if (!accessToken)
            return;
        resetTimer();
        const handler = () => resetTimer();
        ACTIVITY_EVENTS.forEach((event) => {
            document.addEventListener(event, handler, { passive: true });
        });
        return () => {
            if (timerRef.current)
                clearTimeout(timerRef.current);
            ACTIVITY_EVENTS.forEach((event) => {
                document.removeEventListener(event, handler);
            });
        };
    }, [accessToken, resetTimer]);
}
