import { mutations } from "@/app/(app)/[tab]/collections/mutations";
import { useCollectionContext } from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import CreateTask from "@/components/task/create";
import { useUser } from "@/context/useUser";
import { omit } from "@/helpers/omit";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import RefreshControl from "@/ui/RefreshControl";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDidUpdate } from "../../../../utils/useDidUpdate";
import { ColumnEmptyComponent } from "../../emptyComponent";

import { FlashList } from "@shopify/flash-list";
import React from "react";
import { KanbanHeader } from "./Header";

export type ColumnProps =
  | {
      label?: any;
      entities?: never;
      grid?: boolean;
    }
  | {
      label?: never;
      entities?: any[];
      grid?: boolean;
    };

export function Column(props: ColumnProps) {
  const theme = useColorTheme();
  const columnRef = useRef(null);
  const { session } = useUser();
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();
  const { mutate, access, data: collectionData } = useCollectionContext();
  const [refreshing] = useState(false);

  const [showCompleted, setShowCompleted] = useState(
    collectionData.showCompleted
  );

  const isReadOnly = access?.access === "READ_ONLY";

  const data = Object.values(props.label?.entities || props.entities)
    .filter(
      (e) =>
        (showCompleted
          ? true
          : e.completionInstances.length === 0 || e.recurrenceRule) && !e.trash
    )
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (a.completionInstances.length !== b.completionInstances.length)
        return a.completionInstances.length === 0 ? -1 : 1;
      return a.agendaOrder?.toString()?.localeCompare(b.agendaOrder);
    });

  const hasItems = data.length > 0;
  const hasNoTasks =
    Object.keys(props.label?.entities || props?.entities || {}).length === 0;

  const hasNoCompleteTasks =
    data.filter((e) => e.completionInstances.length === 0).length === 0;

  const hasNoIncompleteTasks =
    data.filter((e) => e.completionInstances.length > 0).length === 0;

  const centerContent = data.length === 0;

  useDidUpdate(() => {
    setShowCompleted(collectionData.showCompleted);
  }, [collectionData.showCompleted]);

  return (
    <View
      style={[
        props.grid
          ? {
              position: "relative",
              height: "100%",
              width: "100%",
              maxWidth: "100%",
              borderRadius: 20,
              ...(breakpoints.md && {
                borderWidth: 1,
                borderColor: addHslAlpha(theme[5], 0.5),
              }),
            }
          : {
              ...(breakpoints.md && {
                backgroundColor: theme[2],
                borderRadius: 20,
                borderWidth: 1,
                borderColor: addHslAlpha(theme[5], 0.7),
              }),
              width: breakpoints.md ? 320 : "100%",
              flex: 1,
              minWidth: 5,
              minHeight: 5,
              maxHeight:
                Platform.OS === "web" && !breakpoints.md
                  ? ("calc(100vh - 60px)" as any)
                  : undefined,
            },
      ]}
    >
      {!(!breakpoints.md && !props.grid) && (
        <KanbanHeader
          showInspireMe={data.length === 0}
          grid={props.grid}
          label={{
            ...props.label,
            entitiesLength: Object.values(
              props.label?.entities || props?.entities || {}
            ).filter((e) => e.completionInstances.length === 0).length,
          }}
        />
      )}
      {props.grid ? undefined : (
        <>
          {!isReadOnly && session && (
            <View
              style={{
                padding: 15,
                paddingTop: 10,
                paddingBottom: 0,
                height: 55,
                zIndex: 9999,
              }}
            >
              <CreateTask
                mutate={mutations.categoryBased.add(mutate)}
                defaultValues={{
                  label: omit(["entities"], props.label),
                  collectionId: collectionData.id,
                  date: null,
                }}
              >
                <Button
                  variant="filled"
                  containerStyle={{ flex: 1, zIndex: 99 }}
                  large={!breakpoints.md}
                  bold={!breakpoints.md}
                  textStyle={breakpoints.md && { fontFamily: "body_400" }}
                  iconPosition="end"
                  text="Create"
                  icon="stylus_note"
                  height={breakpoints.md ? 50 : 55}
                />
              </CreateTask>
            </View>
          )}
        </>
      )}

      <LinearGradient
        style={{
          width: "100%",
          height: 30,
          zIndex: 1,
          marginTop: props.grid ? 5 : undefined,
          marginBottom: centerContent && !props.grid ? -90 : -30,
          pointerEvents: "none",
        }}
        colors={[
          theme[breakpoints.md ? 2 : 1],
          addHslAlpha(theme[breakpoints.md ? 2 : 1], 0),
        ]}
      />
      <FlashList
        // onReorder={({ from, to }) => {
        //   mutate(
        //     (oldData) => {
        //       const label = oldData.labels.find((e) => e.id === props.label.id);
        //       if (!label || !label.entities) return oldData;

        //       // Extract keys and reorder them
        //       const entityKeys = Object.keys(label.entities);
        //       const reorderedKeys = reorderItems(entityKeys, from, to);

        //       // Rebuild the object with the new key order
        //       const reorderedEntities = Object.fromEntries(
        //         reorderedKeys.map((key, index) => [
        //           key,
        //           { ...label.entities[key], agendaOrder: index },
        //         ])
        //       );

        //       // Return the updated state
        //       return {
        //         ...oldData,
        //         labels: oldData.labels.map((l) =>
        //           l.id === props.label.id
        //             ? { ...l, entities: reorderedEntities }
        //             : l
        //         ),
        //       };
        //     },
        //     { revalidate: false }
        //   );
        // }}
        ref={columnRef}
        refreshControl={
          !centerContent && (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => mutate()}
            />
          )
        }
        centerContent={centerContent}
        data={data}
        ListHeaderComponent={() => (
          <View>
            {!(!hasNoTasks && hasItems) && (
              <ColumnEmptyComponent
                showInspireMe={hasNoTasks}
                labelId={props.label?.id}
                row={props.grid}
              />
            )}
          </View>
        )}
        // estimatedItemSize={300}
        contentContainerStyle={{
          padding: props.grid ? 10 : 15,
          paddingTop: props.grid ? 5 : 15,
          paddingBottom: insets.bottom + 35,
        }}
        ListFooterComponentStyle={[
          hasNoCompleteTasks && {
            marginBottom: showCompleted ? 10 : -70,
          },
        ]}
        ListFooterComponent={() => (
          <>
            {hasNoTasks ? null : (
              <View style={{ flexDirection: "row" }}>
                <Button
                  onPress={() => setShowCompleted(!showCompleted)}
                  dense
                  containerStyle={{
                    marginRight: "auto",
                    marginTop: hasItems && props.grid ? 20 : 5,
                    marginLeft: !hasItems ? 80 : "auto",
                  }}
                  variant={props.grid ? "filled" : undefined}
                >
                  <ButtonText weight={600}>
                    {showCompleted ? "Hide completed" : "See completed"}
                  </ButtonText>
                  <Icon>{showCompleted ? "expand_less" : "expand_more"}</Icon>
                </Button>
              </View>
            )}
          </>
        )}
        renderItem={({ item }) => (
          <Entity
            isReadOnly={isReadOnly || !session}
            item={item}
            showDate
            onTaskUpdate={mutations.categoryBased.update(mutate)}
          />
        )}
        keyExtractor={(i: any) => i.id}
      />
    </View>
  );
}
