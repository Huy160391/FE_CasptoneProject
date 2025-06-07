/**
 * This utility helps to silence specific console errors that might be generated
 * by third-party scripts or ad blockers.
 */

// Centralize error patterns in a type-safe way
interface ErrorPattern {
    pattern: string;
    source: 'third-party' | 'deprecated' | 'client';
}

const PATTERNS_TO_SILENCE: ErrorPattern[] = [
    { pattern: 'cloudflareinsights', source: 'third-party' },
    { pattern: 'ERR_BLOCKED_BY_CLIENT', source: 'client' },
    { pattern: '[antd: Tabs] `Tabs.TabPane` is deprecated', source: 'deprecated' },
    { pattern: '[antd: Modal] `destroyOnClose` is deprecated', source: 'deprecated' }
];

// Store the original console methods with proper types
type ConsoleMethods = 'error' | 'warn' | 'log';
type ConsoleFunction = (...args: unknown[]) => void;

const originalConsole: Record<ConsoleMethods, ConsoleFunction> = {
    error: console.error,
    warn: console.warn,
    log: console.log
};

// Type-safe function to check if a message should be silenced
const shouldSilence = (args: unknown[]): boolean => {
    if (args.length === 0) return false;

    try {
        const messageStr = JSON.stringify(args);
        return PATTERNS_TO_SILENCE.some(({ pattern }) => messageStr.includes(pattern));
    } catch {
        // If JSON.stringify fails, check each argument individually
        return PATTERNS_TO_SILENCE.some(({ pattern }) =>
            args.some(arg => String(arg).includes(pattern))
        );
    }
};

/**
 * Override console methods with type-safe implementations
 */
export const setupConsoleSilencer = (): void => {
    // Helper function to create console override
    const createConsoleOverride = (method: ConsoleMethods) => {
        return function (this: typeof console, ...args: unknown[]): void {
            if (!shouldSilence(args)) {
                originalConsole[method].apply(this, args);
            }
        };
    };

    // Override each console method
    console.error = createConsoleOverride('error');
    console.warn = createConsoleOverride('warn');

    if (process.env.NODE_ENV === 'production') {
        console.log = createConsoleOverride('log');
    }
};

/**
 * Restore original console behavior
 */
export const restoreConsole = (): void => {
    (Object.keys(originalConsole) as ConsoleMethods[]).forEach(method => {
        console[method] = originalConsole[method];
    });
};

export default setupConsoleSilencer;
