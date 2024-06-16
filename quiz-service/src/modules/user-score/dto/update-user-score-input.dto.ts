import { IsNumber, IsPositive } from 'class-validator';

export class UpdateUserScoreInput {
  // This should be get from the token or something
  @IsNumber()
  userId: number;

  @IsNumber()
  quizId: number;

  @IsPositive()
  score: number;
}
