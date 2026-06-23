export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}