import { EntityRepository, Repository } from 'typeorm';
import { UserScore } from './user-score.entity';
import { plainToClass } from 'class-transformer';

@EntityRepository(UserScore)
export class UserScoreRepository extends Repository<UserScore> {
  async getUserRanks(
    quizId: number,
    limit: number,
    offset: number,
  ): Promise<{
    rank: any[];
    total: number;
  }> {
    const total = await this.count({
      where: {
        quizId,
      },
    });
    console.log('typeof pageSize', typeof limit);
    const rank = await this.query(
      `
      SELECT 
        user_id,
        score,
        RANK() OVER (ORDER BY score DESC) as rank
      FROM 
        user_score
      WHERE 
        quiz_id = $1
      ORDER BY 
        score DESC
      LIMIT $2 OFFSET $3
    `,
      [quizId, limit, offset],
    );

    return {
      rank: rank.map((item) => ({
        userId: item?.user_id,
        score: item?.score,
      })),
      total,
    };
  }
}
