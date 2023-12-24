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
import { FlatList, View, useWindowDimensions } from "react-native";
import CreateTask from "../../task/create";

export function Column({ header, column }) {
  const theme = useColorTheme();
  const { width, height } = useWindowDimensions();
  const pathname = usePathname();

  return (
    <View
      style={{
        ...(width > 600 && {
          backgroundColor: theme[2],
          borderRadius: 20,
        }),
        width: width > 600 ? 300 : width,
        flex: 1,
        overflow: "hidden",
      }}
    >
      {width > 600 && <Header start={column.start} end={column.end} />}
      <FlatList
        style={{ flex: 1, maxHeight: "100%" }}
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
            {header()}
            <View
              style={{
                flexDirection: "row",
                gap: 15,
                paddingBottom: 15,
                paddingHorizontal: width > 600 ? 0 : 15,
              }}
            >
              <CreateTask
                defaultValues={{
                  date: dayjs(column.start),
                }}
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
          padding: width > 600 ? 15 : 0,
          paddingTop: width > 600 ? 15 : 70,
          paddingBottom: getBottomNavigationHeight(pathname) + 20,
          flex: 1,
        }}
        renderItem={({ item }) => {
          const Container = ({ children }) => (
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
