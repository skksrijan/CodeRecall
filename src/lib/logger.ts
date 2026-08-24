/* Lightweight logger that works in Next.js without worker threads.
 * pino + pino-pretty uses thread-stream which crashes in Next.js webpack
 * with MODULE_NOT_FOUND errors on vendor-chunks/lib/worker.js. */

const isDev = process.env.NODE_ENV !== 'production';

const logger = {
  info: (obj: Record<string, unknown>, msg?: string) => {
    if (isDev) console.log(`[INFO] ${msg || ''}`, obj);
  },
  warn: (obj: Record<string, unknown>, msg?: string) => {
    console.warn(`[WARN] ${msg || ''}`, obj);
  },
  error: (obj: Record<string, unknown>, msg?: string) => {
    console.error(`[ERROR] ${msg || ''}`, obj);
  },
  debug: (obj: Record<string, unknown>, msg?: string) => {
    if (isDev) console.debug(`[DEBUG] ${msg || ''}`, obj);
  },
};

export default logger;
