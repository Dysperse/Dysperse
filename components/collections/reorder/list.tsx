"use dom";

import { useSidebarContext } from "@/components/layout/sidebar/context";
import { IListItemData } from "@/components/layout/tabs/list.helpers";
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
import React, { PropsWithChildren, useMemo, useState } from "react";

export function SortableItem({ theme, breakpoints, data }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: data.id });
  const { SIDEBAR_WIDTH, desktopCollapsed } = useSidebarContext();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: 596,
    opacity: isDragging ? 0 : undefined,
    marginLeft: isDragging ? (desktopCollapsed ? -10 : -SIDEBAR_WIDTH) : 0,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <div
        style={{
          padding: 10,
          paddingTop: 0,
          paddingLeft: breakpoints.md ? 50 : 10,
          paddingRight: breakpoints.md ? 50 : 10,
        }}
        {...attributes}
        {...listeners}
      >
        <div
          style={{
            display: "flex",
            padding: 10,
            paddingRight: 20,
            paddingLeft: 20,
            borderRadius: 20,
            alignItems: "center",
            background: `linear-gradient(${theme[3]} 0%, ${theme[4]} 100%)`,
            color: theme[11],
            fontFamily: "body_400",
            gap: 20,
          }}
        >
          <img
            src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${data.emoji}.png`}
            style={{ height: 30, width: 30 }}
          />
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <span style={{ fontFamily: "body_800" }}>{data.name}</span>
            <span style={{ opacity: 0.6 }}>
              {Object.keys(data.entities || {}).length} items
            </span>
          </div>
          <div>
            <span
              style={{
                color: theme[11],
                fontSize: 24,
                display: "flex",
                marginBottom: -1,
                fontFamily: "symbols_outlined",
              }}
            >
              drag_indicator
            </span>
          </div>
        </div>
      </div>
    </div>
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

export default function EditListViewOrder({
  theme,
  data,
  breakpoints,
  onUpdate,
}) {
  const [items, setItems] = useState(data.labels);
  const [active, setActive] = useState<Active | null>(null);

  const activeItem = useMemo(
    () => items.find((item) => item.id === active?.id),
    [active, items]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (over && active.id !== over?.id) {
            // reorder items
            const oldIndex = items.findIndex((x) => x.id === active.id);
            const newIndex = items.findIndex((x) => x.id === over.id);
            const newItems = [...items];
            newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, items[oldIndex]);
            setItems(newItems);

            const listOrder = newItems.map((t) => t.id);
            onUpdate(listOrder);
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
                breakpoints={breakpoints}
                theme={theme}
                key={tab.id}
                data={tab}
              />
            );
          })}
        </SortableContext>
        <SortableOverlay>
          {activeItem ? (
            <SortableItem
              breakpoints={breakpoints}
              theme={theme}
              data={
                data.labels.find((x) => x.id === activeItem.id) as IListItemData
              }
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
