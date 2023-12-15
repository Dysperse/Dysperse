import { Header } from "@/components/perspectives/agenda/Header";
import { Task } from "@/components/task/Task";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import Emoji from "@/ui/emoji";
import { WINDOW_WIDTH } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import CreateTask from "./CreateTask";

export function Column({ header, column }) {
  return (
    <View
      style={{ width: WINDOW_WIDTH > 600 ? 300 : WINDOW_WIDTH }}
      className={WINDOW_WIDTH > 600 ? "border-r border-gray-200" : undefined}
    >
      {WINDOW_WIDTH > 600 && <Header start={column.start} end={column.end} />}
      <FlatList
        ListEmptyComponent={
          <View className="p-4">
            <View className="bg-gray-100 border-2 border-gray-200 rounded-3xl items-center py-10">
              <View className="w-16 border border-gray-300 h-16 bg-gray-200 items-center rounded-full justify-center">
                <Emoji emoji="1f389" size={30} />
              </View>
              <Text textClassName="mt-2 text-xl" weight={400}>
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
              <Pressable
                className={`px-5 py-3 ${
                  WINDOW_WIDTH > 600 ? "rounded-2xl" : ""
                } hover:bg-gray-100 active:bg-gray-200 mb-0.5 flex-row items-center`}
                style={{ gap: 15 }}
              >
                <Pressable className="w-7 h-7 border-2 border-gray-400 active:bg-gray-100 rounded-full items-center justify-center">
                  <Icon
                    style={{ lineHeight: 26.5 }}
                    textClassName="text-gray-400"
                  >
                    add
                  </Icon>
                </Pressable>
                <Text>Create task</Text>
              </Pressable>
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
