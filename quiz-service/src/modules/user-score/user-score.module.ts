import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { UserScoreController } from './user-score.controller';
import { UserScoreService } from './user-score.service';

@Module({
  imports: [SharedModule],
  controllers: [UserScoreController],
  providers: [UserScoreService],
})
export class UserScoreModule {}
