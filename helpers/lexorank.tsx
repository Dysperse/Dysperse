import { LexoRank } from "lexorank";
import { IHasRank, IId, IListItemData, ISortablePayload } from "./List.types";

export const defaultItems = (): IListItemData[] => {
  let currentRank = LexoRank.middle();
  const data: IListItemData[] = [];
  for (let i = 0; i < 10; i++) {
    data.push({
      id: `${i}-id`,
      name: `Item ${i}`,
      rank: currentRank.toString(),
    });
    currentRank = currentRank.genNext();
  }

  return data.sort(sortByLexoRankAsc);
};

export function sortByLexoRankAsc(a: IHasRank, b: IHasRank): number {
  if (!a.rank && b.rank) {
    return -1;
  }
  if (a.rank && !b.rank) {
    return 1;
  }

  if (!a.rank || !b.rank) {
    return 0;
  }

  return a.rank.localeCompare(b.rank);
}

export function createSortablePayloadByIndex<TEntity extends IId & IHasRank>(
  items: TEntity[],
  event: { fromIndex: number; toIndex: number }
): ISortablePayload<TEntity> {
  const { fromIndex, toIndex } = event;
  let input: ISortablePayload<TEntity>;
  const entity = items[fromIndex];
  if (toIndex === 0) {
    const nextEntity = items[toIndex];
    input = {
      prevEntity: undefined,
      entity: entity,
      nextEntity: nextEntity,
    } as ISortablePayload<TEntity>;
  } else if (toIndex === items.length - 1) {
    const prevEntity = items[toIndex];
    input = {
      prevEntity: prevEntity,
      entity: entity,
      nextEntity: undefined,
    } as ISortablePayload<TEntity>;
  } else {
    const prevEntity = items[toIndex];
    const offset = fromIndex > toIndex ? -1 : 1;
    const nextEntity = items[toIndex + offset];
    input = {
      prevEntity: prevEntity,
      entity: entity,
      nextEntity: nextEntity,
    } as ISortablePayload<TEntity>;
  }

  return input;
}

export function getBetweenRankAsc<TEntity extends IId & IHasRank>(
  payload: ISortablePayload<TEntity>
): LexoRank {
  const { prevEntity, entity, nextEntity } = payload;
  let newLexoRank: LexoRank;
  if (!prevEntity && !!nextEntity) {
    newLexoRank = LexoRank.parse(nextEntity.order).genPrev();
  } else if (!nextEntity && !!prevEntity) {
    newLexoRank = LexoRank.parse(prevEntity.order).genNext();
  } else if (!!prevEntity && !!nextEntity) {
    newLexoRank = LexoRank.parse(nextEntity.order).between(
      LexoRank.parse(prevEntity.order)
    );
  } else {
    newLexoRank = LexoRank.parse(entity.order).genNext();
  }

  return newLexoRank;
}
