import { jobQueue } from './queue/jobQueue.js';
import { processTranscriptionJob } from './workers/transcriptionWorker.js';
import { processAISummarizationJob } from './workers/summarizationWorker.js';
import { logger } from '../../utils/logger.js';

export function initializeAIWorkers(): void {
  logger.info('[Workers] Initializing AI Worker Listeners...');

  jobQueue.onTranscriptionJob(async payload => {
    await processTranscriptionJob(payload);
  });

  jobQueue.onAIProcessingJob(async payload => {
    await processAISummarizationJob(payload);
  });

  logger.info('[Workers] AI Worker pipeline is listening for jobs.');
}

export * from './queue/jobQueue.js';
export * from './providers/sttProvider.js';
export * from './providers/llmProvider.js';
export * from './providers/geminiProvider.js';
export * from './workers/transcriptionWorker.js';
export * from './workers/summarizationWorker.js';
export * from './workers/quizGenWorker.js';
export * from './workers/readinessWorker.js';
