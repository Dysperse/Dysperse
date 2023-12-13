import { Header } from "@/components/perspectives/agenda/Header";
import { Task } from "@/components/task/Task";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { WINDOW_WIDTH } from "@gorhom/bottom-sheet";
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
        ListHeaderComponent={
          <>
            {header()}
            <CreateTask
              defaultValues={{
                date: column.start,
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
          paddingTop: WINDOW_WIDTH > 600 ? 10 : 0,
        }}
        renderItem={({ item }) => <Task task={item} />}
        keyExtractor={(i) => `${i.id}-${Math.random()}`}
      />
    </View>
  );
}
