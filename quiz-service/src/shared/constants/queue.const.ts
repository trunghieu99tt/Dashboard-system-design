export const QUEUE_NAME = {
  USER_SCORE_EVENT: 'USER_SCORE_EVENT',
};

export const QUEUE_JOB = {
  UPDATE_SCORE: 'UPDATE_SCORE',
};

export const MAX_RETRY_COUNT = 5;
export const MAX_KEPT_FAILED_JOB_COUNT = 1000;
export const JOB_OPTIONS = {
  attempts: MAX_RETRY_COUNT,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: true,
  removeOnFail: MAX_KEPT_FAILED_JOB_COUNT,
};
