import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { BaseApiResponse } from 'src/shared/dto/base-api-response.dto';
import { GetLeaderBoardOutput } from './dto/get-leader-board-output.dto';
import { GetLeaderBoardQuery } from './dto/get-leader-board-query.dto';
import { LeaderBoardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderBoardController {
  constructor(private readonly leaderBoardService: LeaderBoardService) {}

  @Get(':id')
  async getLeaderBoard(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetLeaderBoardQuery,
  ): Promise<BaseApiResponse<GetLeaderBoardOutput>> {
    const { data, meta } = await this.leaderBoardService.getLeaderBoard(
      id,
      query,
    );

    return {
      data,
      meta,
    };
  }
}
