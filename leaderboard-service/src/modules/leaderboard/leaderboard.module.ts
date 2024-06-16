import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { LeaderBoardController } from './leaderboard.controller';
import { LeaderBoardService } from './leaderboard.service';
import { LeaderBoardInitializationCron } from './leaderboard-initialization.cron';

@Module({
  imports: [SharedModule],
  controllers: [LeaderBoardController],
  providers: [LeaderBoardService, LeaderBoardInitializationCron],
})
export class LeaderBoardModule {}
