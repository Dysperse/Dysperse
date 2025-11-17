import { useCollectionContext } from "@/components/collections/context";
import { TaskLabelChip } from "@/components/task";
import TaskCheckbox from "@/components/task/Checkbox";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { CollectionEmpty } from "../CollectionEmpty";
import { taskSortAlgorithm } from "../skyline";

const incompleteEntitiesFilter = (e) =>
  e.recurrenceRule || e.completionInstances.length === 0;

function TableRow({ item, onTaskUpdate }) {
  const { access } = useCollectionContext();
  const theme = useColorTheme();

  return (
    <View
      style={{
        paddingLeft: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme[5],
        flexDirection: "row",
        height: 35,
      }}
    >
      <View
        style={{
          borderRightWidth: 1,
          borderColor: theme[5],
          width: 30,
          justifyContent: "center",
          alignItems: "center",
          paddingRight: 15,
        }}
      >
        <TaskCheckbox
          isReadOnly={access?.access === "READ_ONLY"}
          task={item}
          mutateList={onTaskUpdate}
        />
      </View>
      <View style={{ borderRightWidth: 1, borderColor: theme[5], width: 50 }}>
        <Button
          chip
          variant={item.pinned ? "filled" : "text"}
          height="100%"
          containerStyle={{ borderRadius: 0 }}
          // onPress={() => router.push(`/everything/labels/${task.label.id}`)}
          icon="push_pin"
          iconStyle={{
            opacity: item.pinned ? 1 : 0.3,
            transform: [{ rotate: item.pinned ? "-45deg" : "0deg" }],
            fontFamily: item.pinned ? "symbols_filled" : "symbols_outlined",
          }}
          textStyle={{ color: theme[11] }}
        />
      </View>
      <View style={{ flex: 3, borderRightWidth: 1, borderColor: theme[5] }}>
        <Button
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            borderRadius: 0,
            paddingHorizontal: 15,
          }}
          height="100%"
        >
          <Text numberOfLines={1} weight={item.pinned ? 800 : undefined}>
            {item.name}
          </Text>
        </Button>
      </View>
      <View
        style={{
          borderRightWidth: 1,
          borderColor: theme[5],
          width: 90,
          justifyContent: "center",
          alignItems: "flex-start",
          paddingHorizontal: 10,
        }}
      >
        <Text>{item.start && dayjs(item.start).format("MMM Do")}</Text>
      </View>
      <View
        style={{
          borderRightWidth: 1,
          borderColor: theme[5],
          flex: 1,
          paddingHorizontal: 15,
        }}
      >
        <Text>{item.storyPoints}</Text>
      </View>
      <View
        style={{
          borderRightWidth: 1,
          borderColor: theme[5],
          width: 120,
        }}
      >
        {item.label && <TaskLabelChip fill task={item} />}
      </View>
    </View>
  );
}

export default function Table() {
  const theme = useColorTheme();
  const { data } = useCollectionContext();

  const shownEntities = Object.values(data.entities)
    .filter(
      (e) => !e.trash && (incompleteEntitiesFilter(e) || data.showCompleted)
    )
    .filter((t) => !t.parentTaskId);

  const labels = data.labels.sort(
    (a, b) => data.listOrder.indexOf(a.id) - data.listOrder.indexOf(b.id)
  );

  const d = taskSortAlgorithm([
    ...(shownEntities || []),
    ...labels.reduce((acc, curr) => {
      const t = Object.values(curr.entities).filter(
        (e) => !e.trash && (incompleteEntitiesFilter(e) || data.showCompleted)
      );

      acc.push(...t);
      return acc;
    }, []),
  ]);

  return (
    <View style={{ flex: 1, marginTop: -15 }}>
      {d.length === 0 ? (
        <CollectionEmpty />
      ) : (
        <>
          <LinearGradient
            style={{
              paddingLeft: 0,
              flexDirection: "row",
              height: 25,
              paddingBottom: 10,
              marginTop: 15,
              borderBottomWidth: 2,
              borderBottomColor: theme[5],
              zIndex: 99,
              boxShadow: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`,
            }}
            colors={[theme[1], theme[3]]}
          >
            <View
              style={{
                width: 45,
              }}
            />
            <View
              style={{
                width: 50,
                paddingHorizontal: 15,
              }}
            ></View>
            <View
              style={{
                flex: 3,
                paddingHorizontal: 15,
                justifyContent: "center",
              }}
            >
              <Text variant="eyebrow">Name</Text>
            </View>
            <View
              style={{
                width: 90,
                justifyContent: "center",
                paddingHorizontal: 10,
              }}
            >
              <Text variant="eyebrow">Start</Text>
            </View>
            <View
              style={{
                flex: 1,
                paddingHorizontal: 15,
                justifyContent: "center",
              }}
            >
              <Text variant="eyebrow">Attachments</Text>
            </View>
            <View
              style={{
                width: 120,
                paddingHorizontal: 15,
                justifyContent: "center",
              }}
            >
              <Text variant="eyebrow">Label</Text>
            </View>
          </LinearGradient>
          <FlashList
            data={d}
            renderItem={({ item }) => (
              <TableRow onTaskUpdate={() => {}} item={item} />
            )}
          />
        </>
      )}
    </View>
  );
}

