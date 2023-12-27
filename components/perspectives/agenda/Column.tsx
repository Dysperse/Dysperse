import { getBottomNavigationHeight } from "@/components/layout/bottom-navigation";
import { Header } from "@/components/perspectives/agenda/Header";
import { Task } from "@/components/task";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { usePathname } from "expo-router";
import React from "react";
import {
  FlatList,
  RefreshControl,
  View,
  useWindowDimensions,
} from "react-native";
import CreateTask from "../../task/create";

export function Column({ mutate, column }: any) {
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  const pathname = usePathname();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  }, [mutate]);

  return (
    <View
      style={{
        ...(width > 600 && {
          backgroundColor: theme[2],
          borderRadius: 20,
        }),
        width: width > 600 ? 300 : width,
        overflow: "hidden",
      }}
    >
      {width > 600 && <Header start={column.start} end={column.end} />}
      <FlatList
        refreshing
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressBackgroundColor={theme[5]}
            colors={[theme[11]]}
          />
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
            }}
          >
            <Avatar
              size={90}
              style={{
                backgroundColor: theme[3],
                borderRadius: 40,
              }}
            >
              <Emoji emoji="1f389" size={40} />
            </Avatar>
            <Text textClassName="text-xl" weight={400}>
              Nothing here!
            </Text>
          </View>
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
        contentContainerStyle={{
          gap: 15,
          padding: width > 600 ? 15 : 0,
          paddingTop: 15,
          paddingBottom: getBottomNavigationHeight(pathname) + 100,
        }}
        renderItem={({ item }) => {
          const Container = ({ children }: { children: React.ReactNode }) => (
            <View
              style={{
                paddingHorizontal: width > 600 ? 0 : 15,
              }}
            >
              {children}
            </View>
          );
          switch (item.type) {
            case "TASK":
              return (
                <Container>
                  <Task task={item} />
                </Container>
              );
            default:
              return (
                <Container>
                  <Text>Invalid entity type</Text>
                </Container>
              );
          }
        }}
        keyExtractor={(i) => `${i.id}-${Math.random()}`}
      />
    </View>
  );
}
