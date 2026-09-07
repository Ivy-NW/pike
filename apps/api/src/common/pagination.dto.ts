import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class PaginationQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

/**
 * Cursor pagination on top of an id-ordered findMany: fetch one extra row to know
 * whether another page exists, without a separate count() query.
 */
export async function paginate<T extends { id: string }>(
  findMany: (args: { take: number; skip?: number; cursor?: { id: string } }) => Promise<T[]>,
  { cursor, limit }: { cursor?: string; limit?: number },
  defaultLimit: number,
): Promise<Page<T>> {
  const take = limit ?? defaultLimit;
  const rows = await findMany({
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > take;
  const items = hasMore ? rows.slice(0, take) : rows;
  const lastItem = items[items.length - 1];
  return { items, nextCursor: hasMore && lastItem ? lastItem.id : null };
}
