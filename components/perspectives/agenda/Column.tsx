import { getBottomNavigationHeight } from "@/components/layout/bottom-navigation";
import { Header } from "@/components/perspectives/agenda/Header";
import { Task } from "@/components/task";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import { usePathname } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, View, useWindowDimensions } from "react-native";
import CreateTask from "../../task/create";

const styles = StyleSheet.create({
  columnCard: {
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderWidth: 2,
  },
});

export function Column({ header, column }) {
  const theme = useColorTheme();
  const { width, height } = useWindowDimensions();
  const pathname = usePathname();

  return (
    <View
      style={{
        ...(width > 600 && {
          borderRightWidth: 1,
          borderRightColor: theme[5],
        }),
        width: width > 600 ? 300 : width,
        maxHeight: height - 1,
        height: height,
      }}
    >
      {width > 600 && <Header start={column.start} end={column.end} />}
      <FlatList
        style={{ flex: 1, maxHeight: "100%" }}
        ListEmptyComponent={
          <View className="p-4">
            <View
              style={[
                styles.columnCard,
                {
                  borderColor: theme[5],
                  backgroundColor: theme[2],
                },
              ]}
            >
              <View
                className="w-16 border-2 h-16 bg-gray-200 items-center rounded-full justify-center"
                style={{ backgroundColor: theme[4], borderColor: theme[6] }}
              >
                <Emoji emoji="1f389" size={30} />
              </View>
              <Text textClassName="text-xl" weight={400}>
                No tasks!
              </Text>
              <Button variant="filled" buttonClassName="mt-2">
                <Icon size={24}>add_circle</Icon>
                <Text textStyle={{ fontSize: 13 }}>Create</Text>
              </Button>
            </View>
          </View>
        }
        ListHeaderComponent={
          <>
            {header()}
            <CreateTask
              defaultValues={{
                date: dayjs(column.start),
              }}
            >
              <ListItemButton
                wrapperStyle={{
                  borderRadius: width > 600 ? 20 : 0,
                  paddingVertical: 15 - (width > 600 ? 5 : 0),
                  paddingHorizontal: 20 - (width > 600 ? 5 : 0),
                }}
              >
                <View
                  style={{
                    width: 25,
                    height: 25,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 99,
                    borderWidth: 2,
                    borderColor: theme[7],
                  }}
                >
                  <Icon
                    size={20}
                    style={{
                      lineHeight: 24.5,
                      color: theme[8],
                    }}
                  >
                    add
                  </Icon>
                </View>
                <Text weight={400}>Create task</Text>
              </ListItemButton>
            </CreateTask>
          </>
        }
        data={column.tasks}
        contentContainerStyle={{
          padding: width > 600 ? 10 : 0,
          paddingTop: width > 600 ? 10 : 70,
          paddingBottom: getBottomNavigationHeight(pathname) + 20,
        }}
        renderItem={({ item }) => <Task task={item} />}
        keyExtractor={(i) => `${i.id}-${Math.random()}`}
      />
    </View>
  );
}
