"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAIWorkers = initializeAIWorkers;
const jobQueue_js_1 = require("./queue/jobQueue.js");
const transcriptionWorker_js_1 = require("./workers/transcriptionWorker.js");
const summarizationWorker_js_1 = require("./workers/summarizationWorker.js");
const logger_js_1 = require("../../backend/src/utils/logger.js");
function initializeAIWorkers() {
    logger_js_1.logger.info('[Workers] Initializing AI Worker Listeners...');
    jobQueue_js_1.jobQueue.onTranscriptionJob(async (payload) => {
        await (0, transcriptionWorker_js_1.processTranscriptionJob)(payload);
    });
    jobQueue_js_1.jobQueue.onAIProcessingJob(async (payload) => {
        await (0, summarizationWorker_js_1.processAISummarizationJob)(payload);
    });
    logger_js_1.logger.info('[Workers] AI Worker pipeline is listening for jobs.');
}
