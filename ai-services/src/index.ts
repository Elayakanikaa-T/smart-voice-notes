import { jobQueue } from './queue/jobQueue.js';
import { processTranscriptionJob } from './workers/transcriptionWorker.js';
import { processAISummarizationJob } from './workers/summarizationWorker.js';
import { logger } from '../../backend/src/utils/logger.js';

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
