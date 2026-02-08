// Common API Response Wrapper
export interface ApiResponse<T> {
    message: string;
    code: number;
    data: T;
}
