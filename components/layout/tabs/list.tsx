"use dom";

import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import {
  Active,
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  DropAnimation,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "expo-router";
import React, { PropsWithChildren, useEffect, useMemo, useState } from "react";
import {
  createSortablePayloadByIndex,
  getBetweenRankAsc,
  IListItemData,
  sortByLexoRankAsc,
} from "./list.helpers";
import { useTabMetadata } from "./useTabMetadata";

export function SortableItem({
  handleCloseTab,
  theme,
  currentTab,
  breakpoints,
  tab,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });
  const router = useRouter();
  const tabData = useTabMetadata(tab.slug, tab);

  //   if (!tab) return null;
  const selected = currentTab === tab.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    WebkitAppRegion: "no-drag",
  };

  const tabName = capitalizeFirstLetter(
    tab.collection?.name ||
      tab.label?.name ||
      tab.profile?.name ||
      tabData.name(tab.params, tab.slug)[0] ||
      ""
  );

  return (
    <>
      <div
        ref={setNodeRef}
        onClick={() =>
          router.replace({
            pathname: tab.slug,
            params: {
              ...tab.params,
              tab: tab.id,
            },
          })
        }
        style={style}
        {...attributes}
        {...listeners}
      >
        <div
          className={`tab ${selected ? "selected" : ""}`}
          style={{
            zIndex: isDragging ? 999999 : 0,
            borderRadius: 15,
            ...(selected && { backgroundColor: theme[4] }),
            position: "relative",
            alignItems: "center",
            display: "flex",
            gap: 10,
            opacity: isDragging ? 0 : undefined,
            paddingLeft: breakpoints.md ? 10 : 10,
            paddingRight: selected ? 30 : breakpoints.md ? 10 : 10,
            height: 50,
          }}
        >
          {(tab.collection || tab.label) && (
            <img
              src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${tab.collection?.emoji?.toLowerCase()}.png`}
              style={{ height: 23, width: 23 }}
            />
          )}
          <div
            style={{
              width: 23,
              height: 23,
              backgroundColor: tab.collection ? theme[5] : "transparent",
              marginLeft: tab.collection ? -23 : 5,
              marginBottom: tab.collection ? -10 : 0,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: tab.collection ? 0 : 5,
            }}
          >
            <span
              style={{
                color: theme[11],
                fontSize: tab.collection ? 17 : 24,
                display: "flex",
                marginBottom: -1,
                fontFamily: selected ? "symbols_filled" : "symbols_outlined",
              }}
            >
              {tabData?.icon?.(tab.params)}
            </span>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            <span
              style={{
                color: theme[11],
                fontSize: 15,
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {tabName}
            </span>
            {tabData.name(tab.params, tab.slug)[1] && (
              <span style={{ color: theme[11], fontSize: 12, opacity: 0.6 }}>
                {capitalizeFirstLetter(
                  tabData.name(tab.params, tab.slug)[1] || ""
                )}
              </span>
            )}
          </div>

          <div
            style={{
              opacity: selected ? 0.5 : 0,
              pointerEvents: selected ? "auto" : "none",
              width: 50,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 50,
              position: "absolute",
              right: 0,
              top: 0,
              backgroundColor: "transparent",
            }}
            onClick={handleCloseTab(tab.id)}
          >
            <span
              style={{
                fontFamily: "symbols_outlined",
                fontSize: 20,
                color: theme[11],
              }}
            >
              close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0",
      },
    },
  }),
};

export function SortableOverlay({ children }: PropsWithChildren) {
  return (
    <DragOverlay dropAnimation={dropAnimationConfig}>{children}</DragOverlay>
  );
}

export default function SortableList({
  theme,
  data,
  currentTab,
  breakpoints,
  mutate,
  sendServerRequest,
  handleCloseTab,
}) {
  const [items, setItems] = useState(data.sort((a, b) => a.order - b.order));
  const [active, setActive] = useState<Active | null>(null);

  const activeItem = useMemo(
    () => items.find((item) => item.id === active?.id),
    [active, items]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    mutate(items, { revalidate: false });
  }, [items, mutate]);

  return (
    <div style={{ height: "100%", overflowY: "auto", overflowX: "hidden" }}>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (over && active.id !== over?.id) {
            setItems(() => {
              // 1. find prev, current, next items
              const sortablePayload = createSortablePayloadByIndex(data, event);
              // 2. calculate new rank
              const newRank = getBetweenRankAsc(sortablePayload);
              const newItems = [...data];
              const currIndex = data.findIndex(
                (x) => x.id === sortablePayload.entity.id
              );
              // 3. replace current rank
              newItems[currIndex] = {
                ...newItems[currIndex],
                order: newRank.toString(),
              } as IListItemData;
              // 4. Send to server
              sendServerRequest({
                id: newItems[currIndex].id,
                order: newItems[currIndex].order,
              });

              // 5. sort by rank
              return newItems
                .sort(sortByLexoRankAsc)
                .sort((a, b) => a.order - b.order);
            });

            setActive(null);
          }
        }}
        onDragStart={({ active }) => {
          setActive(active);
        }}
        onDragCancel={() => setActive(null)}
        modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((tab) => {
            return (
              <SortableItem
                handleCloseTab={handleCloseTab}
                breakpoints={breakpoints}
                theme={theme}
                key={tab.id}
                tab={tab}
                currentTab={currentTab}
              />
            );
          })}
        </SortableContext>
        <SortableOverlay>
          {activeItem ? (
            <SortableItem
              handleCloseTab={handleCloseTab}
              breakpoints={breakpoints}
              theme={theme}
              tab={data.find((x) => x.id === activeItem.id) as IListItemData}
              currentTab={currentTab}
            />
          ) : null}
        </SortableOverlay>
      </DndContext>
      <style>
        {`
        .tab {
            background: ${theme[2]};
            font-family: "body_400", sans-serif;
        }
        .tab:hover {
            background: ${theme[3]};
        }
        .tab:active {
            background: ${theme[4]};
        }
        .tab, .tab * {
            cursor: default!important;
        }
        `}
      </style>
    </div>
  );
}
