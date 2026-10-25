/** Error codes returned by the backend; must match the server's `util/ErrorCode.kt`. */
export const ErrorCode = {
    NOT_WHITELISTED: 'NOT_WHITELISTED',
    ALREADY_REGISTERED: 'ALREADY_REGISTERED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    BAD_REQUEST: 'BAD_REQUEST',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    SUCCESS: 'SUCCESS'
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
