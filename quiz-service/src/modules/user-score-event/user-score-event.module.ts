import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { BullModule } from '@nestjs/bull';
import { QUEUE_NAME } from 'src/shared/constants/queue.const';
import { UserScoreEventCron } from './user-score-event.cron';

@Module({
  imports: [
    SharedModule,
    BullModule.registerQueue({
      name: QUEUE_NAME.USER_SCORE_EVENT,
    }),
  ],
  providers: [UserScoreEventCron],
})
export class UserScoreEventModule {}
