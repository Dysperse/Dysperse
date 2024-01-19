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
  grid,
}: {
  grid?: boolean;
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
    <LinearGradient
      colors={[theme[3], theme[2]]}
      style={[
        columnStyles.header,
        grid && {
          height: 60,
          borderBottomWidth: 1,
          borderBottomColor: theme[5],
        },
      ]}
    >
      <Emoji emoji={label.emoji} size={grid ? 25 : 35} />
      <View
        style={{
          flex: 1,
          ...(grid && { flexDirection: "row", gap: 20, alignItems: "center" }),
        }}
      >
        <Text style={{ fontSize: 20 }} weight={800}>
          {label.name}
        </Text>
        <Text weight={200}>{label.entitiesLength} items</Text>
      </View>
      {grid && (
        <CreateEntityTrigger menuProps={{ style: { marginRight: -25 } }}>
          <IconButton icon="add" disabled />
        </CreateEntityTrigger>
      )}
      <IconButton icon="expand_circle_down" />
    </LinearGradient>
  );
});

function KanbanColumn({ label, grid = false }) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={
        grid
          ? {
              position: "relative",
              height: "100%",
            }
          : {
              ...(breakpoints.md && {
                backgroundColor: theme[2],
                borderRadius: 20,
              }),
              width: breakpoints.md ? 300 : "100%",
              flex: 1,
              minWidth: 5,
              minHeight: 5,
            }
      }
    >
      {breakpoints.md && (
        <KanbanHeader
          grid={grid}
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
          grid ? undefined : (
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
                {
                  <CreateEntityTrigger
                    menuProps={grid ? undefined : { style: { flex: 1 } }}
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
                }
              </View>
            </>
          )
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
  const theme = useColorTheme();

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
      {data.labels.length <= 2 &&
        [...new Array(3)].map((_, i) => (
          <View
            key={i}
            style={{
              width: 300,
              flex: 1,
              minWidth: 5,
              minHeight: 5,
              backgroundColor: theme[2],
              borderRadius: 20,
            }}
          />
        ))}
    </ScrollView>
  );
}

function Grid() {
  const { data } = useCollectionContext();
  const theme = useColorTheme();

  // Create a new array for rendering purposes without modifying the original data
  const displayLabels = [...data.labels];

  if (displayLabels.length % 2 !== 0) displayLabels.push({ empty: true });
  if (displayLabels.length < 4)
    displayLabels.push(
      ...new Array(4 - displayLabels.length).fill({
        empty: true,
      })
    );

  const columnsPerRow = 2;
  const rows = [];

  for (let i = 0; i < displayLabels.length; i += columnsPerRow) {
    const rowLabels = displayLabels.slice(i, i + columnsPerRow);
    const row = rowLabels.map((label) =>
      label.empty ? (
        <View
          key={label.id || Math.random()}
          style={{
            flex: 1,
            backgroundColor: theme[2],
            width: "100%",
            borderRadius: 25,
          }}
        />
      ) : (
        <View
          key={label.id || Math.random()}
          style={{
            flex: 1,
            backgroundColor: theme[2],
            width: "100%",
            borderRadius: 25,
          }}
        >
          <KanbanColumn grid label={label} />
        </View>
      )
    );
    rows.push(
      <View
        key={i / columnsPerRow}
        style={{
          flexDirection: "column",
          gap: 15,
          width: "50%",
        }}
      >
        {row}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      contentContainerStyle={{
        padding: 15,
        gap: 15,
        minWidth: "100%",
        paddingRight: 30,
      }}
      style={{
        minWidth: "100%",
      }}
    >
      {rows}
      {displayLabels.length <= columnsPerRow &&
        [...new Array(columnsPerRow - displayLabels.length)].map((_, i) => (
          <View
            key={i}
            style={{
              width: 300,
              flex: 1,
              minWidth: 5,
              minHeight: 5,
              backgroundColor: theme[2],
              borderRadius: 20,
            }}
          />
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
      return <Grid />;
    case "difficulty":
      return <Text>Difficulty</Text>;
    default:
      return <Text>404: {type}</Text>;
  }
}
