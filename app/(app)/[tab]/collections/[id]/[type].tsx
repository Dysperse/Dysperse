import { columnStyles } from "@/components/collections/columnStyles";
import { useCollectionContext } from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import Perspectives from "@/components/collections/views/agenda";
import {
  CreateEntityTrigger,
  Masonry,
} from "@/components/collections/views/masonry";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingBottom: 10,
    gap: 15,
    marginTop: -15,
  },
});

const KanbanHeader = memo(function KanbanHeader({
  label,
}: {
  label: {
    id: string;
    emoji: string;
    color: string;
    name: string;
    entitiesLength: number;
  };
}) {
  const theme = useColorTheme();
  return (
    <LinearGradient colors={[theme[3], theme[2]]} style={columnStyles.header}>
      <Emoji emoji={label.emoji} size={35} />
      <View>
        <Text style={{ fontSize: 20 }} weight={800}>
          {label.name}
        </Text>
        <Text weight={200}>{label.entitiesLength} items</Text>
      </View>
      <IconButton icon="expand_circle_down" style={{ marginLeft: "auto" }} />
    </LinearGradient>
  );
});

function KanbanColumn({ label }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  return (
    <View
      style={{
        ...(breakpoints.md && {
          backgroundColor: theme[2],
          borderRadius: 20,
        }),
        width: breakpoints.md ? 300 : "100%",
        flex: 1,
        minWidth: 5,
        minHeight: 5,
      }}
    >
      {breakpoints.md && (
        <KanbanHeader
          label={{
            ...label,
            entities: undefined,
            entitiesLength: label.entities.length,
          }}
        />
      )}

      <FlatList
        // refreshControl={
        //   <RefreshControl
        //     // refreshing={refreshing}
        //     // onRefresh={onRefresh}
        //     progressBackgroundColor={theme[5]}
        //     colors={[theme[11]]}
        //     tintColor={theme[11]}
        //   />
        // }
        ListHeaderComponent={
          <>
            <View
              style={[
                styles.header,
                {
                  paddingHorizontal: breakpoints.md ? 0 : 15,
                  paddingTop: breakpoints.md ? 0 : 20,
                },
              ]}
            >
              <CreateEntityTrigger
                menuProps={{ style: { flex: 1 } }}
                // defaultValues={{
                //   date: dayjs(column.start),
                //   agendaOrder: LexoRank.parse(
                //     column.tasks[column.tasks.length - 1]?.agendaOrder ||
                //       LexoRank.max().toString()
                //   )
                //     .genNext()
                //     .toString(),
                // }}
                // mutate={(newTask) => {
                //   console.log(newTask);
                //   if (!newTask) return;
                //   if (
                //     !dayjs(newTask.due)
                //       .utc()
                //       .isBetween(
                //         dayjs(column.start),
                //         dayjs(column.end),
                //         null,
                //         "[]"
                //       ) ||
                //     !newTask.due
                //   )
                //     return;

                //   mutate(
                //     (oldData) =>
                //       oldData.map((oldColumn) =>
                //         oldColumn.start === column.start &&
                //         oldColumn.end === column.end
                //           ? {
                //               ...oldColumn,
                //               tasks: [...oldColumn.tasks, newTask],
                //             }
                //           : oldColumn
                //       ),
                //     {
                //       revalidate: false,
                //     }
                //   );
                // }}
              >
                <Button
                  disabled
                  variant="filled"
                  style={{ flex: 1, minHeight: 50 }}
                >
                  <Icon>add</Icon>
                  <ButtonText>New</ButtonText>
                </Button>
              </CreateEntityTrigger>
            </View>
          </>
        }
        data={label.entities
          .sort((a, b) =>
            a.agendaOrder?.toString()?.localeCompare(b.agendaOrder)
          )
          .sort((x, y) => (x.pinned === y.pinned ? 0 : x.pinned ? -1 : 1))
          .sort((x, y) =>
            x.completionInstances.length === y.completionInstances.length
              ? 0
              : x.completionInstances.length === 0
              ? -1
              : 0
          )}
        // estimatedItemSize={200}
        initialNumToRender={10}
        contentContainerStyle={{
          padding: breakpoints.md ? 15 : 0,
          paddingTop: 15,
          gap: 5,
          // paddingBottom: getBottomNavigationHeight(pathname),
        }}
        // ListEmptyComponent={PerspectivesEmptyComponent}
        renderItem={({ item }) => (
          <Entity
            item={item}
            onTaskUpdate={() => {}}
            openColumnMenu={() => {}}
          />
        )}
        keyExtractor={(i: any, d) => `${i.id}-${d}`}
      />
    </View>
  );
}

function Kanban() {
  const { data } = useCollectionContext();

  return (
    <ScrollView
      horizontal
      contentContainerStyle={{
        flexDirection: "row",
        padding: 15,
        gap: 15,
      }}
    >
      {data.labels.map((label) => (
        <KanbanColumn key={label.id} label={label} />
      ))}
    </ScrollView>
  );
}

export default function Page() {
  const { type } = useLocalSearchParams();

  switch (type) {
    case "agenda":
      return <Perspectives />;
    case "kanban":
      return <Kanban />;
    case "stream":
      return <Text>Stream</Text>;
    case "masonry":
      return <Masonry />;
    case "grid":
      return <Text>Grid</Text>;
    case "difficulty":
      return <Text>Difficulty</Text>;
    default:
      return <Text>404: {type}</Text>;
  }
}
