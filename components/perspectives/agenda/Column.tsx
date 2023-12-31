import { getBottomNavigationHeight } from "@/components/layout/bottom-navigation";
import { Header } from "@/components/perspectives/agenda/Header";
import { Task } from "@/components/task";
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
import { RefreshControl, View, useWindowDimensions } from "react-native";
import { KeyedMutator } from "swr";
import CreateTask from "../../task/create";

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
  switch (item.type) {
    case "TASK":
      return (
        <Container>
          <Task
            onTaskUpdate={(newTask) => {
              mutate(
                (oldData) =>
                  oldData.map((oldColumn) =>
                    oldColumn.start === column.start
                      ? {
                          ...oldColumn,
                          tasks: oldColumn.tasks
                            .map((oldTask) =>
                              oldTask.id === newTask.id
                                ? newTask.trash === true
                                  ? undefined
                                  : newTask
                                : oldTask
                            )
                            .filter((e) => e),
                        }
                      : oldColumn
                  ),
                {
                  revalidate: false,
                }
              );
            }}
            task={item}
          />
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

  return (
    <View
      style={{
        ...(width > 600 && {
          backgroundColor: theme[2],
          borderRadius: 20,
        }),
        width: width > 600 ? 300 : width,
        overflow: "hidden",
        height: "100%",
      }}
    >
      {width > 600 && <Header start={column.start} end={column.end} />}
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
              style={{
                flexDirection: "row",
                paddingBottom: 5,
                gap: 15,
                paddingHorizontal: width > 600 ? 0 : 15,
              }}
            >
              <CreateTask
                defaultValues={{
                  date: dayjs(column.start),
                }}
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
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              minHeight: 300,
            }}
          >
            <Avatar
              size={90}
              style={{
                backgroundColor: theme[3],
                borderRadius: 30,
                marginBottom: 20,
                transform: [{ rotate: "45deg" }],
              }}
            >
              <View style={{ transform: [{ rotate: "-45deg" }] }}>
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
