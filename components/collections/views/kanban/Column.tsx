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
import { TEMPORARY_CONTENT_INSET_FIX } from "@/utils/temporary-scrolling-bug-fix";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDidUpdate } from "../../../../utils/useDidUpdate";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { taskSortAlgorithm } from "../skyline";
import { KanbanHeader } from "./Header";

export type ColumnProps =
  | {
      label?: any;
      entities?: never;
      grid?: boolean;
      index?: number;
    }
  | {
      label?: never;
      entities?: any[];
      grid?: boolean;
      index?: number;
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

  const data = taskSortAlgorithm(
    Object.values(props.label?.entities || props.entities).filter(
      (e) =>
        (showCompleted
          ? true
          : e.completionInstances.length === 0 || e.recurrenceRule) && !e.trash
    )
  ).filter((t) => !t.parentTaskId);

  const hasItems = data.length > 0;

  const hasNoTasks =
    Object.keys(props.label?.entities || props?.entities || {}).length === 0;

  const hasNoIncompleteTasks =
    data.filter((e) => e.completionInstances.length === 0).length === 0;

  const completeTasksExist =
    Object.values(props.label?.entities || props.entities).filter(
      (e) => e.completionInstances.length > 0
    ).length > 0;

  const centerContent = data.length === 0;

  useDidUpdate(() => {
    setShowCompleted(collectionData.showCompleted);
  }, [collectionData.showCompleted]);

  const { width } = useWindowDimensions();

  const showCompletedTrigger = (
    <>
      {hasNoTasks || !completeTasksExist ? null : (
        <View style={{ flexDirection: "row" }}>
          <Button
            onPress={() => setShowCompleted(!showCompleted)}
            dense
            containerStyle={{
              marginRight: "auto",
              zIndex: 999,
              marginTop: hasItems && props.grid ? 20 : 10,
              marginLeft: breakpoints.md
                ? !hasItems && props.grid
                  ? 80
                  : "auto"
                : "auto",
            }}
            variant={"filled"}
          >
            <ButtonText weight={600}>
              {showCompleted ? "Hide completed" : "See completed"}
            </ButtonText>
            <Icon>{showCompleted ? "expand_less" : "expand_more"}</Icon>
          </Button>
        </View>
      )}
    </>
  );

  return (
    <View
      style={[
        props.grid
          ? {
              position: "relative",
              height: "100%",
              width: "100%",
              maxWidth: width,
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
                borderColor: addHslAlpha(theme[5], 0.5),
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
          grid={props.grid}
          label={{
            ...props.label,
            entitiesLength: Object.values(
              props.label?.entities || props?.entities || {}
            ).filter(
              (e) => e.completionInstances.length === 0 && !e.parentTaskId
            ).length,
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
      {data.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ColumnEmptyComponent
            offset={props.index}
            showInspireMe={hasNoTasks}
            labelId={props.label?.id}
            row={props.grid}
          />
          {showCompletedTrigger}
        </View>
      ) : (
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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => mutate()}
            />
          }
          data={data}
          ListHeaderComponent={() => (
            <View>
              {!(!hasNoTasks && hasItems) && (
                <ColumnEmptyComponent
                  offset={props.index}
                  showInspireMe={hasNoTasks}
                  labelId={props.label?.id}
                  row={props.grid}
                />
              )}
            </View>
          )}
          contentContainerStyle={{
            padding: props.grid ? 10 : 15,
            paddingTop: props.grid ? 5 : 15,
            paddingBottom: insets.bottom + 35,
          }}
          contentInset={TEMPORARY_CONTENT_INSET_FIX()}
          ListFooterComponentStyle={[
            hasNoIncompleteTasks && {
              marginBottom: showCompleted ? 10 : -70,
            },
          ]}
          ListFooterComponent={() => <>{showCompletedTrigger}</>}
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
      )}
    </View>
  );
}

