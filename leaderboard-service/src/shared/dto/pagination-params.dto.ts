import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationQuery {
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => {
    return parseInt(value, 10);
  })
  pageSize = 10;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  page = 0;
}
