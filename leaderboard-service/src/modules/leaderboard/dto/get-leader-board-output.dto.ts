import { Expose, Type } from 'class-transformer';

export class GetLeaderBoardOutput {
  @Expose()
  @Type(() => Number)
  id: number;

  @Expose()
  @Type(() => LeaderBoardItem)
  data: LeaderBoardItem[];
}

export class LeaderBoardItem {
  @Expose()
  @Type(() => Number)
  rank: number;

  @Expose()
  @Type(() => Number)
  userId: number;

  @Expose()
  @Type(() => Number)
  score: number;

  @Expose()
  @Type(() => String)
  userName: string;

  @Expose()
  @Type(() => String)
  userAvatar: string;
}
