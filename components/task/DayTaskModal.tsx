import { mutations } from "@/app/(app)/[tab]/collections/mutations";
import BottomSheet from "@/ui/BottomSheet";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { BottomSheetFlashList } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { cloneElement, useRef, useState } from "react";
import { View } from "react-native";
import useSWR from "swr";
import { Entity } from "../collections/entity";
import { taskSortAlgorithm } from "../collections/views/skyline";

export default function DayTaskModal({ children, date, taskId }) {
  const [hasOpened, setHasOpened] = useState(false);
  const sheetRef = useRef(null);
  const trigger = cloneElement(children, {
    onPress: () => {
      setHasOpened(true);
      sheetRef.current?.present();
    },
  });

  const { data, mutate } = useSWR(
    !hasOpened
      ? null
      : [
          "space/collections/collection/planner",
          {
            start: dayjs(date).startOf("day").toISOString(),
            end: dayjs(date).endOf("day").add(1, "second").toISOString(),
            type: "week",
            timezone: dayjs.tz.guess(),
            isPublic: "false",
            id: "-1",
            all: true,
          },
        ]
  );

  const column = data?.find(
    (col) =>
      dayjs(date).toISOString() === dayjs(col.start).toISOString() ||
      dayjs(date).isBetween(col.start, col.end)
  );

  const tasksLength =
    data && column
      ? Object.keys(column.entities).filter((t: any) => t.id !== taskId).length
      : 0;

  return (
    <>
      {trigger}
      <BottomSheet
        sheetRef={sheetRef}
        snapPoints={["70%"]}
        onClose={() => sheetRef.current.close()}
      >
        <View
          style={{
            padding: 20,
            alignItems: "center",
            justifyContent: "center",
            height: 130,
            paddingTop: 30,
          }}
        >
          <Text style={{ fontSize: 25, fontFamily: "serifText700" }}>
            {dayjs(date).format("dddd, MMMM Do")}
          </Text>
          <Text
            weight={300}
            style={{ fontSize: 18, opacity: 0.7, marginTop: 5 }}
          >
            {data
              ? `${tasksLength} other task${
                  tasksLength === 1 ? "" : "s"
                } on this day`
              : "Finding other tasks for this day..."}
          </Text>
        </View>

        {!data ? (
          <View
            style={{
              padding: 20,
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Spinner />
          </View>
        ) : (
          <BottomSheetFlashList
            data={taskSortAlgorithm(
              Object.values(column.entities).filter((t: any) => t.id !== taskId)
            )}
            estimatedItemSize={100}
            contentContainerStyle={{ padding: 10, paddingTop: 0 }}
            centerContent={Object.keys(column.entities).length === 0}
            ListEmptyComponent={() => (
              <View style={{ marginVertical: "auto" }}>
                <Text style={{ textAlign: "center" }}>
                  There are no tasks for this day!
                </Text>
              </View>
            )}
            renderItem={({ item }: any) => (
              <Entity
                showLabel
                dateRange={item.recurrenceDay}
                isReadOnly={false}
                item={item}
                onTaskUpdate={mutations.timeBased.update(mutate)}
              />
            )}
            keyExtractor={(i: any, d) => `${i.id}-${d}`}
          />
        )}
      </BottomSheet>
    </>
  );
}

