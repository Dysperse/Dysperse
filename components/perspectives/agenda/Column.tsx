import { Header } from "@/components/perspectives/agenda/Header";
import { Task } from "@/components/task/Task";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import Emoji from "@/ui/emoji";
import { WINDOW_WIDTH } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import React from "react";
import { FlatList, View } from "react-native";
import CreateTask from "./CreateTask";

export function Column({ header, column }) {
  const theme = useColorTheme();

  return (
    <View
      style={{ width: WINDOW_WIDTH > 600 ? 300 : WINDOW_WIDTH }}
      className={WINDOW_WIDTH > 600 ? "border-r border-gray-200" : undefined}
    >
      {WINDOW_WIDTH > 600 && <Header start={column.start} end={column.end} />}
      <FlatList
        ListEmptyComponent={
          <View className="p-4">
            <View
              style={{
                borderRadius: 28,
                backgroundColor: theme[2],
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 20,
                borderWidth: 2,
                borderColor: theme[5],
                gap: 10,
              }}
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
                wrapperStyle={{ borderRadius: 0, paddingVertical: 10 }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 99,
                    borderWidth: 2,
                    borderColor: theme[11],
                  }}
                >
                  <Icon
                    style={{
                      lineHeight: 26.5,
                      color: theme[11],
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
          padding: WINDOW_WIDTH > 600 ? 10 : 0,
          paddingTop: WINDOW_WIDTH > 600 ? 10 : 70,
        }}
        renderItem={({ item }) => <Task task={item} />}
        keyExtractor={(i) => `${i.id}-${Math.random()}`}
      />
    </View>
  );
}
