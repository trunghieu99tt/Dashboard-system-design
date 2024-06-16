import { Module } from '@nestjs/common';
import { LeaderBoardModule } from './modules/leaderboard/leaderboard.module';
import { SharedModule } from './shared/shared.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UserScoreEventModule } from './modules/user-score-event/user-score-event.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SharedModule,
    LeaderBoardModule,
    UserScoreEventModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
