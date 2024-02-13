import { Entity } from "@/components/collections/entity";
import { useAgendaContext } from "@/components/collections/views/agenda-context";
import { Header } from "@/components/collections/views/agenda/Header";
import Task from "@/components/task";
import CreateTask from "@/components/task/create";
import { useSession } from "@/context/AuthProvider";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import * as shapes from "@/ui/shapes";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { usePathname } from "expo-router";
import { LexoRank } from "lexorank";
import React, { cloneElement, memo, useCallback, useRef } from "react";
import {
  RefreshControl,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { KeyedMutator } from "swr";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingBottom: 10,
    gap: 10,
    marginTop: -15,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingTop: 50,
    width: "100%",
  },
  emptyIcon: { transform: [{ rotate: "-45deg" }] },
  emptyIconContainer: {
    borderRadius: 30,
    marginBottom: 20,
    transform: [{ rotate: "45deg" }],
  },
});

export const ColumnEmptyComponent = memo(function ColumnEmptyComponent({
  row,
}: {
  row?: boolean;
}) {
  const theme = useColorTheme();

  const shapesLength = Array.from({ length: 7 }, (_, i) => `shape${i + 1}`);
  const Shape =
    shapes[shapesLength[Math.floor(Math.random() * shapesLength.length)]];

  const messages = [
    ["1f92b", "Shhh!", "It's quiet here!"],
    ["1f60a", "Enjoy the calm!", "Take a breather"],
    ["1f92b", "Silence is golden!", "Embrace the quiet"],
    ["1f60c", "Pause and relax!", "No plans, no worries"],
    ["1fab4", "Positive vibes", "Idea: Free time?"],
    ["1f4ab", "Energize yourself", "Maybe get some sleep?"],
    ["1fae0", "Peaceful moment!", "Savor the tranquility"],
    ["26c5", "Own your day!", "Effort = Results"],
    ["1f44a", "You're unstoppable!", "Quick stretch or snack"],
    ["1f5ff", "Crushing it!", "No task is too big"],
    ["1f985", "Look at yourself", "You're beautiful."],
  ];

  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <View
      style={[
        styles.empty,
        row && { flexDirection: "row", alignItems: "center", gap: 20 },
      ]}
    >
      <View
        style={{
          paddingHorizontal: 20,
          position: "relative",
          marginBottom: 20,
        }}
      >
        <Shape color={theme[5]} size={100} />
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: "auto",
          }}
        >
          <Emoji emoji={message[0]} size={50} />
        </View>
      </View>
      <View
        style={[row ? { marginTop: -30, flex: 1 } : { alignItems: "center" }]}
      >
        <Text weight={300} style={{ fontSize: 30 }} numberOfLines={1}>
          {message[1]}
        </Text>
        <Text style={{ opacity: 0.6 }} numberOfLines={1}>
          {message[2]}
        </Text>
      </View>
    </View>
  );
});

const renderColumnItem = ({
  onTaskUpdate,
  item,
  width,
  drag,
  isActive,
  openColumnMenu,
}: any & {
  width: any;
  onTaskUpdate: any;
  openColumnMenu: any;
}) => {
  const Container = ({ children }: { children: JSX.Element }) => {
    const trigger = cloneElement(children, { drag, isActive });
    return (
      // <ScaleDecorator activeScale={1.05}>
      <View
        style={{
          paddingHorizontal: width > 600 ? 0 : 15,
          paddingVertical: 5,
        }}
      >
        {trigger}
      </View>
      //</ScaleDecorator>
    );
  };

  switch (item.type) {
    case "TASK":
      return (
        <Container>
          <Task
            onTaskUpdate={onTaskUpdate}
            task={item}
            openColumnMenu={openColumnMenu}
          />
        </Container>
      );
    default:
      return (
        <Container>
          <TouchableOpacity onLongPress={drag} disabled={isActive}>
            <Text>{item.name}</Text>
            <Text>{item.agendaOrder?.toString()}</Text>
          </TouchableOpacity>
        </Container>
      );
  }
};

function ReorderModal({ onTaskUpdate, column, children }) {
  const ref = useRef<BottomSheetModal>(null);
  const handleOpen = useCallback(() => ref.current.present(), []);
  const handleClose = useCallback(() => ref.current.close(), []);

  const trigger = cloneElement(children, { onPress: handleOpen });
  const { session } = useSession();

  const theme = useColorTheme();
  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={ref}
        onClose={handleClose}
        snapPoints={["90%"]}
        enableContentPanningGesture={false}
      >
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 10,
            paddingLeft: 25,
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: theme[4],
          }}
        >
          <Text weight={900} style={{ fontSize: 20 }}>
            Reorder
          </Text>
          <IconButton
            size={55}
            variant="outlined"
            icon="check"
            onPress={handleClose}
          />
        </View>
      </BottomSheet>
    </>
  );
}

function ColumnMenu({ column, children, onTaskUpdate, columnMenuRef }) {
  const { type } = useAgendaContext();
  return (
    <MenuPopover
      trigger={children}
      containerStyle={{ width: 200 }}
      options={[
        { icon: "reorder", text: "Reorder", callback: () => {} },
        { icon: "select_all", text: "Select", callback: () => {} },
        { icon: "ios_share", text: "Share progress", callback: () => {} },
      ]}
    />
  );
}

export function Column({
  mutate,
  column,
}: {
  mutate: KeyedMutator<any>;
  column: any;
}) {
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const { id: collectionId } = useAgendaContext();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  }, [mutate]);

  const onTaskUpdate = (newTask) => {
    mutate(
      (oldData) => {
        if (
          oldData
            .find((oldColumn) => oldColumn.start === column.start)
            ?.tasks.find((oldTask) => oldTask === newTask)
        ) {
          return oldData;
        }
        return oldData.map((oldColumn) =>
          oldColumn.start === column.start
            ? {
                ...oldColumn,
                tasks: oldColumn.tasks
                  .map((oldTask) =>
                    oldTask?.id === newTask?.id
                      ? newTask.trash === true ||
                        !dayjs(newTask.due).isBetween(
                          column.start,
                          column.end,
                          null,
                          "[]"
                        )
                        ? undefined
                        : newTask
                      : oldTask
                  )
                  .filter((e) => e),
              }
            : oldColumn
        );
      },
      {
        revalidate: false,
      }
    );
  };

  const columnMenuRef = useRef(null);
  // const openColumnMenu = useCallback(() => columnMenuRef.current.present(), []);
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        ...(breakpoints.md && {
          backgroundColor: theme[2],
          borderRadius: 20,
        }),
        width: breakpoints.md ? 300 : width,
        flex: 1,
        minWidth: 5,
        minHeight: 5,
      }}
    >
      {breakpoints.md && <Header start={column.start} end={column.end} />}
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressBackgroundColor={theme[5]}
            colors={[theme[11]]}
            tintColor={theme[11]}
          />
        }
        ListHeaderComponent={
          <>
            <View
              style={[
                styles.header,
                {
                  paddingHorizontal: breakpoints.md ? 0 : 5,
                  paddingTop: breakpoints.md ? 0 : 20,
                },
              ]}
            >
              <CreateTask
                defaultValues={{
                  collectionId:
                    collectionId === "all" ? undefined : collectionId,
                  date: dayjs(column.start),
                  agendaOrder: LexoRank.parse(
                    column.tasks[column.tasks.length - 1]?.agendaOrder ||
                      LexoRank.max().toString()
                  )
                    .genNext()
                    .toString(),
                }}
                mutate={(newTask) => {
                  console.log(newTask);
                  if (!newTask) return;
                  if (
                    !dayjs(newTask.due)
                      .utc()
                      .isBetween(
                        dayjs(column.start),
                        dayjs(column.end),
                        null,
                        "[]"
                      ) ||
                    !newTask.due
                  )
                    return;

                  mutate(
                    (oldData) =>
                      oldData.map((oldColumn) =>
                        oldColumn.start === column.start &&
                        oldColumn.end === column.end
                          ? {
                              ...oldColumn,
                              tasks: [...oldColumn.tasks, newTask],
                            }
                          : oldColumn
                      ),
                    {
                      revalidate: false,
                    }
                  );
                }}
              >
                <Button variant="filled" style={{ flex: 1, minHeight: 50 }}>
                  <ButtonText>New</ButtonText>
                  <Icon>add</Icon>
                </Button>
              </CreateTask>
              <ColumnMenu
                column={column}
                onTaskUpdate={onTaskUpdate}
                columnMenuRef={columnMenuRef}
              >
                <Button variant="outlined" style={{ height: 50 }}>
                  <Icon>more_horiz</Icon>
                </Button>
              </ColumnMenu>
            </View>
          </>
        }
        data={column.tasks
          .sort((a, b) =>
            a.agendaOrder?.toString()?.localeCompare(b.agendaOrder)
          )
          .sort((x, y) => (x.pinned === y.pinned ? 0 : x.pinned ? -1 : 1))
          .sort((x, y) =>
            x.completionInstances.length === y.completionInstances.length
              ? 0
              : x.completionInstances.length === 0
              ? -1
              : 0
          )}
        // estimatedItemSize={200}
        initialNumToRender={10}
        contentContainerStyle={{
          padding: width > 600 ? 15 : 0,
          paddingBottom: 50,
          paddingTop: 15,
          paddingHorizontal: 15,
          gap: 0,
        }}
        style={{
          flex: 1,
          maxHeight: "100%",
        }}
        ListEmptyComponent={() => <ColumnEmptyComponent />}
        renderItem={({ item }) => (
          <Entity
            showLabel
            item={item}
            onTaskUpdate={onTaskUpdate}
            openColumnMenu={() => {}}
          />
        )}
        keyExtractor={(i: any, d) => `${i.id}-${d}`}
      />
    </View>
  );
}
