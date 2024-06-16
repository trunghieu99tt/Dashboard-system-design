import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { DoneCallback, Job } from 'bull';
import { QUEUE_JOB, QUEUE_NAME } from 'src/shared/constants/queue.const';
import { RedisService } from 'src/shared/redis/redis.service';
import { LEADER_BOARD_CONST } from '../leaderboard/constants/leaderboard.const';
import { UserScoreEventType } from './user-score-event.enum';

@Processor(QUEUE_NAME.USER_SCORE_EVENT)
export class UserScoreEventConsumer {
  constructor(private redisService: RedisService) {}

  @OnQueueActive()
  onActive(job: Job) {
    console.debug(
      `Job ${job.id} has been added to the ${QUEUE_NAME.USER_SCORE_EVENT} queue`,
    );
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    console.debug(
      `Job ${job.id} has been completed from the ${QUEUE_NAME.USER_SCORE_EVENT} queue`,
    );
  }

  @OnQueueFailed()
  async onFailed(job: Job, err: Error) {
    console.error(
      `Job ${job.id} has been failed from the ${QUEUE_NAME.USER_SCORE_EVENT} queue with error ${err}`,
    );
  }

  @Process({
    name: QUEUE_JOB.UPDATE_SCORE,
    concurrency: 5,
  })
  async handleTransaction(job: Job, done: DoneCallback) {
    try {
      const { userId, quizId, type, score } = job.data;
      if (userId && quizId && type && score) {
        const key = `${LEADER_BOARD_CONST.LEADER_BOARD_PREFIX}_${quizId}`;
        if (type == UserScoreEventType.ADD_SCORE) {
          this.redisService.incScoreOfElementInSortedSet(key, userId, score);
        }
      }
      done(null);
    } catch (error) {
      console.log('error', error);
      done(error);
    }
  }
}
