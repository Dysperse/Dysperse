import { getBottomNavigationHeight } from "@/components/layout/bottom-navigation";
import { Header } from "@/components/perspectives/agenda/Header";
import Task from "@/components/task";
import { useSession } from "@/context/AuthProvider";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import { Menu } from "@/ui/Menu";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import * as shapes from "@/ui/shapes";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { usePathname } from "expo-router";
import React, { cloneElement, memo, useCallback, useRef } from "react";
import {
  RefreshControl,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { RenderItemParams } from "react-native-draggable-flatlist";
import { TouchableOpacity } from "react-native-gesture-handler";
import SortableList from "react-native-ui-lib/sortableList";
import { KeyedMutator } from "swr";
import CreateTask from "../../task/create";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingBottom: 5,
    gap: 15,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: 250,
  },
  emptyIcon: { transform: [{ rotate: "-45deg" }] },
  emptyIconContainer: {
    borderRadius: 30,
    marginBottom: 20,
    transform: [{ rotate: "45deg" }],
  },
});

const PerspectivesEmptyComponent = memo(function PerspectivesEmptyComponent() {
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
    <View style={styles.empty}>
      <View style={{ position: "relative", marginBottom: 20 }}>
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
          }}
        >
          <Emoji emoji={message[0]} size={50} />
        </View>
      </View>
      <Text weight={300} style={{ fontSize: 30 }}>
        {message[1]}
      </Text>
      <Text style={{ opacity: 0.6 }}>{message[2]}</Text>
    </View>
  );
});

const renderColumnItem = ({
  onTaskUpdate,
  item,
  width,
  drag,
  isActive,
}: RenderItemParams<any> & {
  width: any;
  onTaskUpdate: any;
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
          <Task onTaskUpdate={onTaskUpdate} task={item} />
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

function ReorderModal({ column, children }) {
  const ref = useRef<BottomSheetModal>(null);
  const handleOpen = useCallback(() => ref.current.present(), []);
  const handleClose = useCallback(() => ref.current.close(), []);

  const trigger = cloneElement(children, { onPress: handleOpen });
  return (
    <>
      {trigger}
      <BottomSheet sheetRef={ref} onClose={handleClose} snapPoints={["90%"]}>
        <SortableList
          data={column.tasks}
          onOrderChange={() => {}}
          renderItem={({ item }) => (
            <View style={{ height: 100 }}>
              <Text>{JSON.stringify(item)}</Text>
            </View>
          )}
          keyExtractor={(i) => i.id}
        />
      </BottomSheet>
    </>
  );
}

function ColumnMenu({ column, children }) {
  const ref = useRef<BottomSheetModal>(null);

  return (
    <Menu menuRef={ref} trigger={children} height={[365]}>
      <View style={{ paddingHorizontal: 15, gap: 15 }}>
        <Button style={{ height: 90 }} variant="filled">
          <Icon size={30}>select</Icon>
          <ButtonText style={{ fontSize: 20 }} weight={800}>
            Select
          </ButtonText>
        </Button>
        <ReorderModal column={column}>
          <Button style={{ height: 90 }} variant="filled">
            <Icon size={30}>low_priority</Icon>
            <ButtonText style={{ fontSize: 20 }} weight={800}>
              Reorder
            </ButtonText>
          </Button>
        </ReorderModal>
        <Button style={{ height: 90 }} variant="filled">
          <Icon size={30}>ios_share</Icon>
          <ButtonText style={{ fontSize: 20 }} weight={800}>
            Share progress
          </ButtonText>
        </Button>
      </View>
    </Menu>
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
  const { width, height } = useWindowDimensions();
  const { session } = useSession();
  const pathname = usePathname();

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
                      ? newTask.trash === true
                        ? undefined
                        : newTask
                      : oldTask
                  )
                  .filter((e) => e),

                // .sort((a, b) => (a.pinned ? 0 : 1) - (b.pinned ? 0 : 1))
                // .sort(
                //   (a, b) =>
                //     (a.completionInstances.length !== 0 ? 1 : 0) -
                //     (b.completionInstances.length !== 0 ? 1 : 0)
                // ),
              }
            : oldColumn
        );
      },
      {
        revalidate: false,
      }
    );
  };

  const renderColumnItemWrapper = (props) =>
    renderColumnItem({ ...props, width, onTaskUpdate });

  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        ...(breakpoints.lg && {
          backgroundColor: theme[2],
          borderRadius: 20,
        }),
        width: breakpoints.lg ? 300 : width,
        flex: 1,
        minWidth: 5,
        minHeight: 5,
      }}
    >
      {breakpoints.lg && <Header start={column.start} end={column.end} />}
      <FlashList
        // onDragEnd={async (params) => {
        //   const previousItem = LexoRank.parse(
        //     params.data[params.to - 1]?.agendaOrder ?? LexoRank.min().toString()
        //   );
        //   const nextItem = LexoRank.parse(
        //     params.data[params.to + 1]?.agendaOrder ?? LexoRank.max().toString()
        //   );
        //   const newId = previousItem.between(nextItem).toString();
        //   const task = column.tasks[params.from];
        //   onTaskUpdate({
        //     ...task,
        //     agendaOrder: newId,
        //   });

        //   sendApiRequest(session, "PUT", "space/entity", {
        //     id: task.id,
        //     agendaOrder: newId,
        //   }).catch((e) => {
        //     onTaskUpdate(task);
        //     Toast.show({
        //       type: "error",
        //       text1: "Something went wrong. Please try again later.",
        //     });
        //   });
        // }}
        // containerStyle={{ flex: 1 }}
        // renderPlaceholder={() => (
        //   <View style={{ height: 10, backgroundColor: "red", width: "100%" }} />
        // )}
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
                { paddingHorizontal: breakpoints.lg ? 0 : 15 },
              ]}
            >
              <CreateTask
                defaultValues={{ date: dayjs(column.start) }}
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
                <Button variant="filled" style={{ flex: 1 }}>
                  <Icon>add</Icon>
                  <ButtonText>Create</ButtonText>
                </Button>
              </CreateTask>
              <ColumnMenu column={column}>
                <Button variant="outlined">
                  <Icon>more_horiz</Icon>
                </Button>
              </ColumnMenu>
            </View>
          </>
        }
        data={column.tasks.sort((a, b) =>
          a.agendaOrder?.toString()?.localeCompare(b.agendaOrder)
        )}
        estimatedItemSize={103}
        contentContainerStyle={{
          padding: width > 600 ? 15 : 0,
          paddingTop: 15,
          paddingBottom: getBottomNavigationHeight(pathname),
        }}
        ListEmptyComponent={PerspectivesEmptyComponent}
        renderItem={renderColumnItemWrapper}
        keyExtractor={(i: any) => i.id}
      />
    </View>
  );
}
