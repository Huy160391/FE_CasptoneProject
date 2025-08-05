import { useRef, useCallback } from 'react';

interface RateLimitOptions {
    maxCalls: number;
    windowMs: number;
}

interface CallRecord {
    timestamp: number;
}

export const useRateLimit = (options: RateLimitOptions) => {
    const { maxCalls, windowMs } = options;
    const callsRef = useRef<CallRecord[]>([]);

    const isAllowed = useCallback((): boolean => {
        const now = Date.now();
        const windowStart = now - windowMs;

        // Remove old calls outside the window
        callsRef.current = callsRef.current.filter(
            call => call.timestamp > windowStart
        );

        // Check if we're under the limit
        if (callsRef.current.length < maxCalls) {
            callsRef.current.push({ timestamp: now });
            return true;
        }

        return false;
    }, [maxCalls, windowMs]);

    const getRemainingTime = useCallback((): number => {
        if (callsRef.current.length === 0) return 0;
        
        const oldestCall = callsRef.current[0];
        const timeUntilReset = (oldestCall.timestamp + windowMs) - Date.now();
        
        return Math.max(0, timeUntilReset);
    }, [windowMs]);

    const reset = useCallback(() => {
        callsRef.current = [];
    }, []);

    return {
        isAllowed,
        getRemainingTime,
        reset,
        currentCalls: callsRef.current.length
    };
};

// Hook for debouncing API calls
export const useDebounce = (callback: Function, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout>();

    const debouncedCallback = useCallback((...args: any[]) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);

    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    return { debouncedCallback, cancel };
};
