import { logger } from '../utils/logger.js';

// ----- In-memory instant queue -----
// Uses a single registered handler (guards against hot-reload duplicates)
type JobHandler = (name: string, data: any) => Promise<void>;
let jobHandler: JobHandler | null = null;
let handlerRegistered = false;

export const meetingQueue = {
  add: async (name: string, data: any) => {
    if (!jobHandler) {
      logger.warn(`[Queue] No handler registered yet for job "${name}". Job dropped.`);
      return { id: `dropped-${Date.now()}` } as any;
    }
    // Fire immediately without any additional async hop
    const handler = jobHandler;
    setImmediate(() => {
      handler(name, data).catch((e: any) =>
        logger.error(`[Queue] Job "${name}" failed: ${e.message}`)
      );
    });
    return { id: `mem-${Date.now()}` } as any;
  },

  onJob: (handler: JobHandler) => {
    if (handlerRegistered) {
      // Prevent duplicate registration on hot-reload
      logger.debug('[Queue] Handler already registered, skipping duplicate.');
      return;
    }
    jobHandler = handler;
    handlerRegistered = true;
    logger.info('[Queue] In-memory job handler registered.');
  },

  /** Expose null so meetingWorker knows not to attempt BullMQ Worker */
  bullQueue: null as null,
};
