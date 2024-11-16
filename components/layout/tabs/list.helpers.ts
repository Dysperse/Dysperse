import { UniqueIdentifier } from "@dnd-kit/core";
import { DragEndEvent } from "@dnd-kit/core/dist/types";
import { LexoRank } from "lexorank";

export interface IId {
  id: UniqueIdentifier;
}

export interface IHasRank {
  order: string;
}

export interface IListItemData extends IId, IHasRank {
  name: string;
}

export interface ISortablePayload<TEntity extends IId> {
  prevEntity?: TEntity;
  entity: TEntity;
  nextEntity?: TEntity;
}

export const defaultItems = (): IListItemData[] => {
  let currentRank = LexoRank.middle();
  const data: IListItemData[] = [];
  for (let i = 0; i < 10; i++) {
    data.push({
      id: `${i}-id`,
      name: `Item ${i}`,
      order: currentRank.toString(),
    });
    currentRank = currentRank.genNext();
  }

  return data.sort(sortByLexoRankAsc);
};

export function sortByLexoRankAsc(a: IHasRank, b: IHasRank): number {
  if (!a.order && b.order) {
    return -1;
  }
  if (a.order && !b.order) {
    return 1;
  }

  if (!a.order || !b.order) {
    return 0;
  }

  return a.order.localeCompare(b.order);
}

export function createSortablePayloadByIndex<TEntity extends IId & IHasRank>(
  items: TEntity[],
  event: DragEndEvent
): ISortablePayload<TEntity> {
  const { active, over } = event;
  const oldIndex = items.findIndex((x) => x.id === active.id);
  const newIndex = items.findIndex((x) => x.id === over?.id);
  let input: ISortablePayload<TEntity>;
  const entity = items[oldIndex];
  if (newIndex === 0) {
    const nextEntity = items[newIndex];
    input = {
      prevEntity: undefined,
      entity: entity,
      nextEntity: nextEntity,
    } as ISortablePayload<TEntity>;
  } else if (newIndex === items.length - 1) {
    const prevEntity = items[newIndex];
    input = {
      prevEntity: prevEntity,
      entity: entity,
      nextEntity: undefined,
    } as ISortablePayload<TEntity>;
  } else {
    const prevEntity = items[newIndex];
    const offset = oldIndex > newIndex ? -1 : 1;
    const nextEntity = items[newIndex + offset];
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
