import { Module } from '@nestjs/common';
import { UserScoreEventConsumer } from './user-score-event.consumer';
import { SharedModule } from 'src/shared/shared.module';
import { BullModule } from '@nestjs/bull';
import { QUEUE_NAME } from 'src/shared/constants/queue.const';

@Module({
  imports: [
    SharedModule,
    BullModule.registerQueue({
      name: QUEUE_NAME.USER_SCORE_EVENT,
    }),
  ],
  providers: [UserScoreEventConsumer],
})
export class UserScoreEventModule {}
