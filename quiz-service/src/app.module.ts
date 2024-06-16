import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserScoreEventModule } from './modules/user-score-event/user-score-event.module';
import { UserScoreModule } from './modules/user-score/user-score.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(), UserScoreEventModule, UserScoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
