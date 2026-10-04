export interface Envelope<T> {
  ok: boolean;
  data: T;
  error?: { code: string; message: string };
}