import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UpdateUserScoreInput } from './dto/update-user-score-input.dto';
import { UserScoreService } from './user-score.service';

@Controller('user-score')
export class UserScoreController {
  constructor(private readonly userScoreService: UserScoreService) {}

  @Post('update')
  @HttpCode(200)
  async updateScore(@Body() updateUserScoreInput: UpdateUserScoreInput) {
    await this.userScoreService.updateScore(updateUserScoreInput);
    return;
  }
}
