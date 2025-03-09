import { useCollectionContext } from "@/components/collections/context";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { CollectionEmpty } from "../CollectionEmpty";
import { Column } from "./Column";
import { KanbanContext } from "./context";

function ColumnSwitcher({ columns, setCurrentColumn, currentColumn }) {
  const theme = useColorTheme();
  const { openLabelPicker } = useCollectionContext();

  const itemCount = Object.keys(columns[currentColumn]?.entities || {}).length;
  const flatListRef = useRef<FlatList>(null);

  return (
    <>
      <FlatList
        ref={flatListRef}
        horizontal
        data={[...columns, "create"]}
        keyExtractor={(column) => column.id}
        contentContainerStyle={{
          justifyContent: "center",
          paddingHorizontal: 23,
          paddingVertical: 10,
          gap: 10,
        }}
        style={{
          maxHeight: 65,
        }}
        renderItem={({ item: column, index: i }) =>
          column === "create" ? (
            <IconButton icon="edit" size={40} onPress={openLabelPicker} />
          ) : (
            <Button
              variant={currentColumn === i ? "filled" : "text"}
              onPress={() => {
                setCurrentColumn(i);
                setTimeout(() => {
                  flatListRef.current?.scrollToIndex({
                    index: i,
                    animated: true,
                    viewOffset: 20,
                  });
                }, 100);
              }}
              style={{
                opacity: i === currentColumn ? 1 : 0.6,
                alignItems: "center",
                overflow: "visible",
              }}
              containerStyle={{ overflow: "visible", borderRadius: 15 }}
            >
              <Emoji emoji={column.emoji} />
              <Text
                style={{
                  marginLeft: 5,
                  fontSize: 20,
                  fontFamily: "serifText700",
                  textAlign: "left",
                  color: theme[11],
                }}
                numberOfLines={1}
              >
                {column?.name}
              </Text>
              <Icon
                style={{
                  opacity: currentColumn === i ? 1 : 0,
                  marginRight: currentColumn === i ? 0 : -35,
                }}
              >
                expand_more
              </Icon>
            </Button>
          )
        }
      />
      <Text
        style={{
          opacity: 0.6,
          color: theme[11],
          marginTop: -30,
          fontSize: 20,
          marginBottom: 10,
          paddingHorizontal: 30,
        }}
      >
        {itemCount} item{itemCount !== 1 ? "s" : ""}
      </Text>
    </>
  );
}

export default function Kanban() {
  const breakpoints = useResponsiveBreakpoints();
  const { data, openLabelPicker, access, isPublic } = useCollectionContext();

  const [currentColumn, setCurrentColumn] = useState(0);

  const { hiddenLabels: rawHiddenLabels } = useLocalSearchParams();
  const hiddenLabels = rawHiddenLabels?.split(",") || [];

  const columns = data.kanbanOrder
    ? data.kanbanOrder
        .map((id) => data.labels.find((l) => l.id === id))
        .filter((c) => !hiddenLabels.includes(c.id))
    : [];

  const isReadOnly = access?.access === "READ_ONLY" || isPublic;

  return !data.labels ? null : (
    <KanbanContext.Provider
      value={{
        currentColumn,
        setCurrentColumn,
        columnsLength: data.labels.length,
        hasOther: data.entities.length > 0,
      }}
    >
      {data.labels.length === 0 ? (
        <CollectionEmpty />
      ) : (
        <ScrollView
          horizontal
          contentContainerStyle={[
            { flexDirection: "row", gap: 15 },
            breakpoints.md
              ? { padding: 15 }
              : { width: "100%", flexDirection: "column" },
          ]}
          scrollEnabled={breakpoints.md}
        >
          {breakpoints.md
            ? columns.map(
                (label) => label && <Column key={label.id} label={label} />
              )
            : columns[currentColumn] && (
                <Column label={columns[currentColumn]} />
              )}
          {data && Object.keys(data.entities)?.length > 0 && breakpoints.md && (
            <Column entities={data.entities} />
          )}
          {breakpoints.md && !isReadOnly && (
            <View
              style={{
                width: 320,
                maxWidth: 100,
                flex: 1,
                minWidth: 5,
                minHeight: 5,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconButton
                icon="add"
                variant="outlined"
                size={40}
                onPress={openLabelPicker}
              />
            </View>
          )}
        </ScrollView>
      )}
    </KanbanContext.Provider>
  );
}

