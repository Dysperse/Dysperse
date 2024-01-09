import { getBottomNavigationHeight } from "@/components/layout/bottom-navigation";
import { Header } from "@/components/perspectives/agenda/Header";
import Task from "@/components/task";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { usePathname } from "expo-router";
import React from "react";
import {
  RefreshControl,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
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
    minHeight: 300,
  },
  emptyIcon: { transform: [{ rotate: "-45deg" }] },
  emptyIconContainer: {
    borderRadius: 30,
    marginBottom: 20,
    transform: [{ rotate: "45deg" }],
  },
});

const renderColumnItem = ({ item, width, mutate, column }: any) => {
  const Container = ({ children }: { children: React.ReactNode }) => (
    <View
      style={{
        paddingHorizontal: width > 600 ? 0 : 15,
        paddingVertical: 5,
      }}
    >
      {children}
    </View>
  );

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
                  .filter((e) => e)
                  .sort((a, b) => (a.pinned ? 0 : 1) - (b.pinned ? 0 : 1))
                  .sort(
                    (a, b) =>
                      (a.completionInstances.length !== 0 ? 1 : 0) -
                      (b.completionInstances.length !== 0 ? 1 : 0)
                  ),
              }
            : oldColumn
        );
      },
      {
        revalidate: false,
      }
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
          <Text>Invalid entity type</Text>
        </Container>
      );
  }
};

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

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  }, [mutate]);

  const renderColumnItemWrapper = (props) =>
    renderColumnItem({ ...props, width, mutate, column });
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
                mutate={() => mutate()}
              >
                <Button variant="filled" style={{ flex: 1 }}>
                  <Icon>add</Icon>
                  <ButtonText>Create</ButtonText>
                </Button>
              </CreateTask>
              <Button variant="outlined">
                <Icon>more_horiz</Icon>
              </Button>
            </View>
          </>
        }
        data={column.tasks}
        estimatedItemSize={103}
        contentContainerStyle={{
          padding: width > 600 ? 15 : 0,
          paddingTop: 15,
          paddingBottom: getBottomNavigationHeight(pathname),
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Avatar
              size={90}
              style={[styles.emptyIconContainer, { backgroundColor: theme[3] }]}
            >
              <View style={styles.emptyIcon}>
                <Emoji emoji="1f92b" size={40} />
              </View>
            </Avatar>
            <Text weight={300} style={{ fontSize: 30 }}>
              Shhh!
            </Text>
            <Text style={{ opacity: 0.6 }}>It's quiet here...</Text>
          </View>
        }
        renderItem={renderColumnItemWrapper}
        keyExtractor={(i: any) => i.id}
      />
    </View>
  );
}
